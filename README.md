# TDL Maker
Open `index.html` (offline, double-click). Pick features, fill URL/key/company, download `.tdl`, load via F1 > TDL & Add-On > Manage Local TDLs.
- `gen.js` = generator source (inlined into index.html; re-inline after editing). `node build-examples.js` regenerates `examples/` and runs the structure check.
- Placeholders: {company} {companyname} {fromdate} {todate} (YYYYMMDD).
**Status: UNTESTED on real TallyPrime.** Load each output and fix any error lines Tally reports.
