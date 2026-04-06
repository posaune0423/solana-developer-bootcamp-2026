---
name: db-query
description: Query and analyze the project's PostgreSQL database using arbitrary SQL. Use when the user asks to inspect data, run analytics queries, check table contents, debug data issues, or explore the database schema. Triggers on requests mentioning DB, database, SQL, query, table data, row counts, or data analysis.
allowed-tools: Bash(bun:*)
---

# Database Query & Analysis

Execute arbitrary SQL against the project's PostgreSQL database. Uses `DATABASE_URL` from `.env` and `postgres` (postgres.js).

## How to query

```bash
bun run .agents/skills/db-query/scripts/query.ts "<sql>"
```

Multiple queries at once (results keyed as `q0`, `q1`, ...):

```bash
bun run .agents/skills/db-query/scripts/query.ts "<sql1>" "<sql2>" "<sql3>"
```

Output is always JSON to stdout.

## Database Schema Reference

Two schemas: **public** (app-owned) and **substreams** (on-chain data).

### public schema

| Table                | Key Columns                                                          | Description           |
| -------------------- | -------------------------------------------------------------------- | --------------------- |
| `users`              | id, wallet_address, telegram_user_id, twitter_username               | User accounts         |
| `agents`             | id, creator_id→users, name, is_published, pricing_type, price_amount | AI agents             |
| `conditions`         | id, agent_id→agents, creator_id→users, dsl_json, is_active           | DSL alert conditions  |
| `notification_logs`  | id, condition_id→conditions, mint_address, called_at, call_mc_sol    | First-call gate       |
| `chat_messages`      | id, user_id→users, agent_id→agents, role, content                    | Chat history          |
| `token_dirty`        | mint_address (PK), changed_fields, dirty_at                          | Rule evaluation queue |
| `purchase_intents`   | id, user_id, agent_id, price_lamports, status                        | Purchase splits       |
| `purchases`          | id, purchase_intent_id, tx_signature, verified_at                    | On-chain purchases    |
| `agent_ownerships`   | id, user_id, agent_id, status, is_active                             | Agent access grants   |
| `mv_agent_pnl_stats` | agent_id, call_count, avg_max_pnl_pct, median_max_pnl_pct            | (MV) Agent PnL stats  |

### substreams schema

| Table                                         | Key Columns                                                                                                              | Description            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| `substreams.tokens`                           | mint_address (PK), platform_type, creator_address, symbol                                                                | Token creation data    |
| `substreams.token_metrics`                    | mint_address (PK), price_lamports, mc_lamports, ath_mc_lamports, holder_count                                            | Current metrics        |
| `substreams.trades`                           | signature+ix_index+inner_ix_index+event_index (PK), mint_address, wallet_address, side, sol_amount_lamports, mc_lamports | Trade events           |
| `substreams.wallet_labels`                    | mint_address+wallet_address+label_kind (PK), detected_timestamp                                                          | Wallet classifications |
| `substreams.wallets`                          | address (PK)                                                                                                             | Wallet registry        |
| `substreams.mv_trade_window_buckets_5m`       | mint_address, bucket_start, min/max_mc_sol, volume_sol                                                                   | (MV) 5m buckets        |
| `substreams.mv_trade_window_5m/15m/1h/4h/24h` | mint_address, min/max_mc_sol, volume_sol                                                                                 | (MV) Rolling windows   |
| `substreams.v_trade_window_agg`               | mint_address, window, min/max_mc_sol, volume_sol                                                                         | (View) Unified windows |
| `substreams.v_token_mc_history`               | mint_address, block_timestamp, mc_lamports, mc_sol                                                                       | (View) MC time series  |

### Key Relationships

- `agents.creator_id` → `users.id`
- `conditions.agent_id` → `agents.id`
- `notification_logs.condition_id` → `conditions.id`
- `trades.mint_address` = `tokens.mint_address` = `token_metrics.mint_address`
- `wallet_labels.wallet_address` = `trades.wallet_address`

## Safety

- **READ-ONLY**: Do not run INSERT/UPDATE/DELETE unless the user explicitly asks. Always confirm destructive operations.
- **LIMIT**: `substreams.trades` can have millions of rows. Always use LIMIT or aggregate functions.
