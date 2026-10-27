# TDL Maker v0.2
Open `index.html` offline (double-click). Tick features, fill endpoint/auth, download `.tdl`, load via **F1 > TDL & Add-On > Manage Local TDLs**.

**Status: generated TDL is UNTESTED on real TallyPrime.** Badges in the UI: **V** = syntax taken from TallyHelp docs, **E** = experimental. Lines marked `;; [EXPERIMENTAL]` in the output are least certain.

## Dev
- `gen.js` – generator (source of truth). `template.html` – UI. `node build.js` inlines gen.js into `index.html`.
- `node build-examples.js` – regenerates `examples/*.tdl` and runs the structure check (headers, quotes, parens, duplicate/missing definitions, known attributes). Not a Tally compile check.

## Features
| Feature | Confidence |
|---|---|
| Gateway menu, config screen (persistent variables), From/To dates | V |
| Push 13 voucher types, 7 master types (HTTP Post) | V (action) / E (voucher type filter `$$IsVchTypeOf`) |
| Auth: `x-api-key` / Basic via `Export Header`, key in body, `?apikey=` | V |
| Scheduled sync: `[System: Event]` TIMER + System Start `Start Timer` | V |
| Company gate by name | V; GSTIN method name E |
| JSON format, full depth (ledger/inventory/bill allocations/GST rate), stock summary | E |
| Incremental by AlterID (persistent per entity), chunk per month/day (`While` loop) | E |
| Sync-status UDF (`TSSynced`, `TSSyncedOn`, index 21001-2), skip synced | E (marks synced even if the post failed) |
| Auto-push on voucher / ledger / stock item save (`On: Form Accept`) | E |
| Sync log report + re-run all | E (per-entity last run + count; no per-error history) |
| Pull ledgers / stock items from remote XML (`Remote URL` + `Walk`/`New Object`/`Create Target`) | E; voucher pull not implemented |

## Backend contract
- POST `{base}/{entity}` (e.g. `/sales`, `/creditnotes`, `/ledgers`, `/stocksummary`, `/voucher` for auto-save), body `<ENVELOPE>` with header fields + `VOUCHER`/`MASTER` rows.
- Reply `<ENVELOPE><STATUS>1</STATUS></ENVELOPE>` for success (HTTP Post success rule).
- Pull: GET `{base}/pull/ledgers`, `{base}/pull/items` returning `<ENVELOPE><LEDGER><NAME/><PARENT/></LEDGER>...`.
