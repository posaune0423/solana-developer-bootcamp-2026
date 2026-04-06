#!/usr/bin/env bun
/**
 * Execute arbitrary SQL against DATABASE_URL.
 *
 * Usage:
 *   bun run .agents/skills/db-query/scripts/query.ts "<sql>"
 *   bun run .agents/skills/db-query/scripts/query.ts "<sql>" "<sql>" ...
 *
 * Multiple SQL statements are executed sequentially and results are printed as JSON.
 */

import postgres from "postgres";

const queries = process.argv.slice(2);
if (queries.length === 0) {
  console.error("Usage: bun run query.ts '<sql>' ['<sql>' ...]");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

try {
  if (queries.length === 1) {
    const rows = await sql.unsafe(queries[0]!);
    console.log(JSON.stringify(rows, null, 2));
  } else {
    const results: Record<string, unknown> = {};
    for (let i = 0; i < queries.length; i++) {
      results[`q${i}`] = await sql.unsafe(queries[i]!);
    }
    console.log(JSON.stringify(results, null, 2));
  }
} finally {
  await sql.end({ timeout: 1 });
}
