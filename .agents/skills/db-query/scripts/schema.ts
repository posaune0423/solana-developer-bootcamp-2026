#!/usr/bin/env bun
/**
 * Introspect the database schema and output table/column information.
 *
 * Usage:
 *   bun run .agents/skills/db-query/scripts/schema.ts [--schema public|substreams|all] [--table TABLE_NAME]
 *
 * Environment:
 *   DATABASE_URL - PostgreSQL connection string (loaded from .env automatically by Bun)
 *
 * Examples:
 *   bun run .agents/skills/db-query/scripts/schema.ts                    # all schemas
 *   bun run .agents/skills/db-query/scripts/schema.ts --schema substreams
 *   bun run .agents/skills/db-query/scripts/schema.ts --table tokens
 */

import postgres from "postgres";

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function flag(name: string, fallback: string): string {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const val = args[idx + 1];
  args.splice(idx, 2);
  return val ?? fallback;
}

const schemaFilter = flag("schema", "all");
const tableFilter = flag("table", "");

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

const connString = process.env["DATABASE_URL"];
if (!connString) {
  console.error("ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

function deriveSsl(url: string) {
  try {
    const u = new URL(url);
    if (u.searchParams.get("sslmode") === "disable") return false;
    if (["localhost", "127.0.0.1", "::1"].includes(u.hostname)) return false;
    return { rejectUnauthorized: false } as const;
  } catch {
    return false;
  }
}

const sql = postgres(connString, {
  ssl: deriveSsl(connString),
  idle_timeout: 5,
  max: 1,
});

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

try {
  // Build WHERE conditions
  const conditions: string[] = [];
  if (schemaFilter !== "all") {
    conditions.push(`t.table_schema = '${schemaFilter}'`);
  } else {
    conditions.push(`t.table_schema IN ('public', 'substreams')`);
  }
  if (tableFilter) {
    conditions.push(`t.table_name = '${tableFilter}'`);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get tables with columns
  const tablesQuery = `
    SELECT
      t.table_schema,
      t.table_name,
      t.table_type,
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      c.character_maximum_length,
      c.numeric_precision,
      c.numeric_scale
    FROM information_schema.tables t
    JOIN information_schema.columns c
      ON c.table_schema = t.table_schema AND c.table_name = t.table_name
    ${where}
    ORDER BY t.table_schema, t.table_name, c.ordinal_position
  `;

  const rows = await sql.unsafe(tablesQuery);

  if (rows.length === 0) {
    console.log("No tables found matching the filter.");
    process.exit(0);
  }

  // Get indexes
  const indexQuery = `
    SELECT
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname IN ('public', 'substreams')
    ${tableFilter ? `AND tablename = '${tableFilter}'` : ""}
    ORDER BY schemaname, tablename, indexname
  `;
  const indexes = await sql.unsafe(indexQuery);

  // Get primary keys
  const pkQuery = `
    SELECT
      tc.table_schema,
      tc.table_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema IN ('public', 'substreams')
    ${tableFilter ? `AND tc.table_name = '${tableFilter}'` : ""}
    ORDER BY tc.table_schema, tc.table_name
  `;
  const pks = await sql.unsafe(pkQuery);
  const pkSet = new Set(
    (pks as unknown as Array<{ table_schema: string; table_name: string; column_name: string }>).map(
      p => `${p.table_schema}.${p.table_name}.${p.column_name}`,
    ),
  );

  // Get foreign keys
  const fkQuery = `
    SELECT
      tc.table_schema,
      tc.table_name,
      kcu.column_name,
      ccu.table_schema AS ref_schema,
      ccu.table_name AS ref_table,
      ccu.column_name AS ref_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema IN ('public', 'substreams')
    ${tableFilter ? `AND tc.table_name = '${tableFilter}'` : ""}
  `;
  const fks = await sql.unsafe(fkQuery);
  const fkMap = new Map<string, string>();
  for (const fk of fks as unknown as Array<{
    table_schema: string;
    table_name: string;
    column_name: string;
    ref_schema: string;
    ref_table: string;
    ref_column: string;
  }>) {
    fkMap.set(
      `${fk.table_schema}.${fk.table_name}.${fk.column_name}`,
      `→ ${fk.ref_schema}.${fk.ref_table}(${fk.ref_column})`,
    );
  }

  // Get materialized views
  const mvQuery = `
    SELECT schemaname, matviewname
    FROM pg_matviews
    WHERE schemaname IN ('public', 'substreams')
    ORDER BY schemaname, matviewname
  `;
  const mvs = await sql.unsafe(mvQuery);
  const mvSet = new Set(
    (mvs as unknown as Array<{ schemaname: string; matviewname: string }>).map(m => `${m.schemaname}.${m.matviewname}`),
  );

  // Group by table
  type Row = {
    table_schema: string;
    table_name: string;
    table_type: string;
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
    character_maximum_length: number | null;
    numeric_precision: number | null;
    numeric_scale: number | null;
  };
  const grouped = new Map<string, Row[]>();
  for (const row of rows as unknown as Row[]) {
    const key = `${row.table_schema}.${row.table_name}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(row);
  }

  // Output
  for (const [key, cols] of grouped) {
    const first = cols[0]!;
    const isMV = mvSet.has(key);
    const typeLabel =
      isMV ? "MATERIALIZED VIEW"
      : first.table_type === "VIEW" ? "VIEW"
      : "TABLE";

    console.log(`\n${"=".repeat(70)}`);
    console.log(`${typeLabel}: ${key}`);
    console.log("=".repeat(70));

    for (const col of cols) {
      const pk = pkSet.has(`${col.table_schema}.${col.table_name}.${col.column_name}`) ? " [PK]" : "";
      const fk = fkMap.get(`${col.table_schema}.${col.table_name}.${col.column_name}`) ?? "";
      const nullable = col.is_nullable === "YES" ? " NULL" : " NOT NULL";
      let dtype = col.data_type;
      if (col.character_maximum_length) dtype += `(${col.character_maximum_length})`;
      if (col.numeric_precision && col.data_type === "numeric")
        dtype += `(${col.numeric_precision},${col.numeric_scale})`;
      console.log(`  ${col.column_name.padEnd(35)} ${dtype.padEnd(25)}${nullable}${pk}${fk ? ` ${fk}` : ""}`);
    }

    // Show indexes for this table (pg_indexes column names)
    // cspell:ignore tablename schemaname indexname indexdef
    const tableIndexes = (
      indexes as unknown as Array<{ schemaname: string; tablename: string; indexname: string; indexdef: string }>
    ).filter(i => `${i.schemaname}.${i.tablename}` === key);
    if (tableIndexes.length > 0) {
      console.log("  ---");
      for (const idx of tableIndexes) {
        console.log(`  INDEX: ${idx.indexname}`);
      }
    }
  }

  console.log(`\n\nTotal: ${grouped.size} table(s)/view(s)`);
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${msg}`);
  process.exit(1);
} finally {
  await sql.end();
}
