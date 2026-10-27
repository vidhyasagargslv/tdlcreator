# Mock backend for TDL Maker
Run on any PC on the same network as Tally (Node 18+, no npm install):
```
node server.js                 # port 8787, API key "test-key"
PORT=9100 MOCK_KEY=abc node server.js
MOCK_FAIL=1 node server.js     # always reply STATUS 0 (test that nothing is marked synced)
```
Windows PowerShell: `$env:MOCK_KEY="test-key"; node server.js`. Allow port 8787 in Windows Firewall if Tally is on another PC.
- `POST /push/<entity>` – saves body to `received/`, checks ENVELOPE/HEADER/API key, counts rows, replies `<ENVELOPE><STATUS>1</STATUS>…`.
- `GET /pull/<entity>` – serves `samples/<entity>.xml`. Edit samples to test your own data.
- `GET /` – lists received files.
