const fs=require('fs'),{genTDL,validateTDL}=require('./gen.js');
const all=['Sales','Purchases','SalesOrders','PurchaseOrders','Receipts','Payments','Ledgers','StockItems'];
const ex={ 'full-xml':{menuName:'Sync',menuKey:'Y',config:1,dates:1,fromDefault:'month',entities:all,format:'XML',pull:1,url:'https://api.example.com/tally/{company}?from={fromdate}&to={todate}',apiKey:'YOUR_API_KEY',company:'ACME'},
 'sales-json':{menuName:'Sales Sync',menuKey:'Y',config:1,dates:1,fromDefault:'fy',entities:['Sales','Receipts'],format:'JSON',pull:0,url:'https://api.example.com/{company}',apiKey:'KEY',company:'C1'}};
let bad=0;for(const[n,o]of Object.entries(ex)){const t=genTDL(o);const e=validateTDL(t);if(e.length){bad=1;console.log(n,e)}fs.writeFileSync('examples/'+n+'.tdl',t);console.log(n,'ok',t.length)}
process.exit(bad);
