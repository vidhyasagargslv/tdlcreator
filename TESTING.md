# Testing Core sync on the Windows Tally PC
Use a **test company** (never live data). Record any error line Tally shows and send it back.

## 0. Prepare
1. Install Node 18+ on the Tally PC (or any PC on the LAN). Copy `tools/mock-server` there.
2. `cd tools\mock-server` → `node server.js`. Note the PC's IP (`ipconfig`). Allow port 8787 in Windows Firewall if needed.
3. Open `index.html` → Mode **Core sync** → click **Apply "Core sync" preset**.
4. Endpoint: API URL `http://<IP>:8787`, API key `test-key`. Download `tallysync.tdl` to e.g. `C:\TallySync\tallysync.tdl`.

## 1. Load
- [ ] F1 > TDL & Add-On > Manage Local TDLs > Load on startup: Yes > add `C:\TallySync\tallysync.tdl`.
- [ ] Status shows **Loaded** (if "Error", note the line number + message shown, and stop here).
- [ ] Gateway shows **Sync**. Open it: Configuration, Date Range, Push, Pull, Sync Log.

## 2. Config persistence
- [ ] Configuration: change Company Code, accept. Close and reopen TallyPrime → value kept.
- [ ] Date Range shows current month by default; change it → kept after restart.

## 3. Pull masters (dependency order)
- [ ] Pull > Groups → message "created 2". Check Chart of Accounts: Mock Customers (under Sundry Debtors), Mock Suppliers.
- [ ] Units → Nos, Kgs. Godowns → Mock Warehouse. Stock Groups → Mock Finished Goods.
- [ ] Ledgers → 6 created. Open Mock Customer A: parent, GSTIN, state, pincode, email, mobile, address lines.
- [ ] Stock Items → Mock Widget (group, unit Nos, opening 50 @ 80 = 4000).
- [ ] Run Ledgers pull again → "altered 6, created 0" (no duplicates).
- [ ] Edit `samples/ledgers.xml` (change a pincode) → pull → value updated in Tally.

## 4. Pull orders
- [ ] Pull > Sales Orders → "created 1". Display > Day Book (set date 27-10-2026): Sales Order MOCK-SO-1, Mock Customer A, Widget 10 Nos @100, CGST 90, SGST 90, total 1180, godown Mock Warehouse, due date 05-11-2026.
- [ ] Pull again → "skipped 1" (no duplicate).
- [ ] Purchase Orders → MOCK-PO-1 for Mock Supplier B with Mock Purchase ledger.
- [ ] If an order fails: note the errors count, open the mock samples and check names match Tally exactly.

## 5. Push
- [ ] Create a Sales Order and a Purchase Order manually in Tally within the date range.
- [ ] Push > Sales Orders → "Success". Mock console shows `PUSH salesorders: N rows … OK` and `N vouchers, X inventory entries`.
- [ ] Open `tools/mock-server/received/salesorders-*.xml`: check party, items, qty, rate, godown, due date, ledger entries, GST. Note any empty tag that should have a value.
- [ ] Repeat for Purchase Orders, Ledgers, Groups, Units, Godowns, Stock Groups, Stock Items, Closing Stock.
- [ ] Push Sales Orders again with no changes → COUNT 0 (incremental). Alter one order → push → only that order sent.
- [ ] Push ALL → Sync Log opens with OK per entity.

## 6. Failure handling
- [ ] Stop mock, start with `MOCK_FAIL=1` (PowerShell `$env:MOCK_FAIL="1"; node server.js`).
- [ ] Alter an order, push → "Failed – nothing marked as synced", log shows FAILED.
- [ ] Restart mock normally, push → the same order is sent again (it was not marked synced).
- [ ] Wrong API key in Configuration → push fails (mock logs `bad api key`).
- [ ] Stop the mock entirely → push shows an error, Tally does not hang/crash.

## 7. Company gate (if enabled)
- [ ] Open a different company → push/pull show "blocked".

## Report back
TallyPrime version (F1 > About), the TDL load status/error text, and for each checkbox: pass / fail + message.
