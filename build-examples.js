const fs=require('fs'),{genTDL,validateTDL,TS_VCH,TS_MST}=require('./gen.js');
const base={menuName:'Sync',menuKey:'Y',config:1,dates:1,fromDefault:'month',format:'XML',depth:'header',incremental:'none',chunk:'none',auth:'header',basic:'',gate:'none',gateCompany:'',gateGstin:'',url:'https://api.example.com/tally/{company}',apiKey:'YOUR_API_KEY',company:'ACME',log:1,stock:0,udf:0,autoMst:0,timer:0,timerMin:15,pull:0,vouchers:['Sales','Purchases'],masters:['Ledgers'],autoVch:[]};
const ex={'basic-xml':{},
 'everything':{vouchers:Object.keys(TS_VCH),masters:Object.keys(TS_MST),stock:1,depth:'full',incremental:'alterid',chunk:'month',udf:1,autoVch:['Sales','Purchases'],autoMst:1,timer:1,pull:1,gate:'gstin',gateCompany:'ACME Pvt Ltd',gateGstin:'29ABCDE1234F1Z5'},
 'sales-json-query':{format:'JSON',auth:'query',vouchers:['Sales','Receipts','CreditNotes'],fromDefault:'fy',gate:'name',gateCompany:'ACME Pvt Ltd',timer:1,timerMin:30}};
fs.readdirSync('examples').forEach(f=>fs.unlinkSync('examples/'+f));
let bad=0;for(const[n,x]of Object.entries(ex)){const t=genTDL({...base,...x});const e=validateTDL(t);if(e.length){bad=1;console.log(n,e)}fs.writeFileSync('examples/'+n+'.tdl',t);console.log(n,e.length?'FAIL':'ok',t.split('\n').length,'lines')}
process.exit(bad);
