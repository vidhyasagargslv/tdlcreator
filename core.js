// TDL Maker - "Core sync" generator: SO, PO, inventory masters, closing stock, ledgers, groups.
// Uses only patterns documented on TallyHelp (see README "References").
const CORE_ENT={
 SalesOrders:{kind:'vch',vt:'Sales Order',label:'Sales Orders',sales:true},
 PurchaseOrders:{kind:'vch',vt:'Purchase Order',label:'Purchase Orders',sales:false},
 Groups:{kind:'mst',type:'Group',label:'Groups',tag:'GROUP'},
 Ledgers:{kind:'mst',type:'Ledger',label:'Ledgers / Parties',tag:'LEDGER'},
 Units:{kind:'mst',type:'Unit',label:'Units',tag:'UNIT'},
 Godowns:{kind:'mst',type:'Godown',label:'Godowns',tag:'GODOWN'},
 StockGroups:{kind:'mst',type:'Stock Group',label:'Stock Groups',tag:'STOCKGROUP'},
 StockItems:{kind:'mst',type:'Stock Item',label:'Stock Items',tag:'STOCKITEM'},
 ClosingStock:{kind:'stock',type:'Stock Item',label:'Closing Stock',tag:'STOCKITEM'}};
// dependency order for pull (and push-all)
const CORE_ORDER=['Groups','Units','Godowns','StockGroups','Ledgers','StockItems','ClosingStock','SalesOrders','PurchaseOrders'];
const CORE_PULLABLE=['Groups','Units','Godowns','StockGroups','Ledgers','StockItems','SalesOrders','PurchaseOrders'];
// push field lists: [Field name, XML tag, expression]  (expression evaluated on the Tally object)
const num=x=>'$$String:$$Number:'+x;
const MF={
 Groups:[['NAME','$Name'],['PARENT','$Parent'],['ISREVENUE','$$String:$IsRevenue'],['GUID','$GUID'],['MASTERID','$$String:$MasterID'],['ALTERID','$$String:$AlterID']],
 Ledgers:[['NAME','$Name'],['PARENT','$Parent'],['GSTIN','$PartyGSTIN'],['STATE','$LedStateName'],['COUNTRY','$CountryName'],['PINCODE','$PinCode'],['EMAIL','$Email'],['MOBILE','$LedgerMobile'],['CONTACT','$LedgerContact'],['ADDRESS','$$FullList:Address:$Address'],['OPENINGBALANCE',num('$OpeningBalance')],['CLOSINGBALANCE',num('$ClosingBalance')],['GUID','$GUID'],['MASTERID','$$String:$MasterID'],['ALTERID','$$String:$AlterID']],
 Units:[['NAME','$Name'],['FORMALNAME','$OriginalName'],['DECIMALPLACES','$$String:$DecimalPlaces'],['ISSIMPLEUNIT','$$String:$IsSimpleUnit'],['GUID','$GUID'],['MASTERID','$$String:$MasterID'],['ALTERID','$$String:$AlterID']],
 Godowns:[['NAME','$Name'],['PARENT','$Parent'],['GUID','$GUID'],['MASTERID','$$String:$MasterID'],['ALTERID','$$String:$AlterID']],
 StockGroups:[['NAME','$Name'],['PARENT','$Parent'],['GUID','$GUID'],['MASTERID','$$String:$MasterID'],['ALTERID','$$String:$AlterID']],
 StockItems:[['NAME','$Name'],['PARENT','$Parent'],['CATEGORY','$Category'],['BASEUNITS','$BaseUnits'],['GSTAPPLICABLE','$GSTApplicable'],['HSNCODE','$$String:$GSTDetails[Last].HSNCode'],['OPENINGQTY',num('$OpeningBalance')],['OPENINGRATE',num('$OpeningRate')],['OPENINGVALUE',num('$OpeningValue')],['CLOSINGQTY',num('$ClosingBalance')],['CLOSINGVALUE',num('$ClosingValue')],['GUID','$GUID'],['MASTERID','$$String:$MasterID'],['ALTERID','$$String:$AlterID']],
 ClosingStock:[['NAME','$Name'],['PARENT','$Parent'],['BASEUNITS','$BaseUnits'],['CLOSINGQTY',num('$ClosingBalance')],['CLOSINGRATE',num('$ClosingRate')],['CLOSINGVALUE',num('$ClosingValue')]]};
const VF=[['DATE','$$String:$Date:UniversalDate'],['VOUCHERTYPE','$VoucherTypeName'],['VOUCHERNUMBER','$VoucherNumber'],['REFERENCE','$Reference'],['PARTYNAME','$PartyLedgerName'],['PARTYGSTIN','$PartyGSTIN'],['PLACEOFSUPPLY','$PlaceOfSupply'],['NARRATION','$Narration'],['TOTAL',num('$Amount')],['GUID','$GUID'],['MASTERID','$$String:$MasterID'],['ALTERID','$$String:$AlterID']];
const IF_=[['STOCKITEM','$StockItemName'],['QTY',num('$BilledQty')],['ACTUALQTY',num('$ActualQty')],['RATE',num('$Rate')],['DISCOUNT',num('$Discount')],['AMOUNT',num('$Amount')],['GSTRATE','$$String:$GSTRate']];
const BF=[['GODOWN','$GodownName'],['BATCH','$BatchName'],['ORDERNO','$OrderNo'],['DUEDATE','$$String:$OrderDueDate:UniversalDate'],['QTY',num('$BilledQty')],['AMOUNT',num('$Amount')]];
const AF=[['LEDGERNAME','$LedgerName'],['AMOUNT',num('$Amount')]];
const LF=[['LEDGERNAME','$LedgerName'],['AMOUNT',num('$Amount')],['ISPARTY','$$String:$IsPartyLedger']];

function genCore(o){
 const L=[],P=(...a)=>a.forEach(s=>L.push(s)),q=s=>String(s==null?'':s).replace(/"/g,"'");
 const push=CORE_ORDER.filter(e=>(o.corePush||[]).includes(e)),pull=CORE_ORDER.filter(e=>(o.corePull||[]).includes(e)&&CORE_PULLABLE.includes(e));
 const inc=o.coreIncremental!==false&&o.coreIncremental!=='0';
 const fromE=o.dates?'##TSFromDate':'##SVFromDate',toE=o.dates?'##TSToDate':'##SVToDate';
 let FN=0;const fld=(prefix,tag,expr)=>{const n='TSC '+prefix+' '+tag;FIELDS.push([n,tag,expr]);return n};const FIELDS=[];
 P(';; ===== TDL Maker v0.3 - CORE SYNC - generated '+new Date().toISOString().slice(0,10)+' =====',
  ';; Push: '+(push.join(', ')||'none'),';; Pull: '+(pull.join(', ')||'none'),
  ';; Incremental push (AlterID high-water mark, advanced only on STATUS=1): '+(inc?'Yes':'No')+' | Auth: '+o.auth+' | Gate: '+o.gate,
  ';; Base URL: '+o.url,';; Backend contract: see README.md / TESTING.md. Success reply = <ENVELOPE><STATUS>1</STATUS></ENVELOPE>',
  ';; Load via F1 > TDL & Add-On > Manage Local TDLs.  NOT YET VERIFIED ON A REAL TALLYPRIME - follow TESTING.md.','');
 // menu
 P('[#Menu: Gateway of Tally]','    Add: Key Item: At End: '+o.menuName+': '+o.menuKey+': Menu: TSC Main','');
 P('[Menu: TSC Main]','    Title: "'+q(o.menuName)+'"','    Key Item: Configuration: C: Display: TSC Config');
 if(o.dates)P('    Key Item: Date Range: D: Display: TSC Dates');
 if(push.length)P('    Key Item: Push to server: U: Menu: TSC Push Menu');
 if(pull.length)P('    Key Item: Pull from server: L: Menu: TSC Pull Menu');
 P('    Key Item: Sync Log: Y: Display: TSC Log','    Item: Blank','    Key Item: @@locQuit: Q: Menu Quit','');
 const keys='123456789ABEFGHIJKMNO';
 if(push.length){P('[Menu: TSC Push Menu]','    Title: "Push to server"');push.forEach((e,i)=>P('    Key Item: Push '+CORE_ENT[e].label+': '+keys[i]+': Call: TSC Push '+e));
  P('    Key Item: Push ALL (dependency order): P: Call: TSC Push All');if(inc)P('    Key Item: Reset incremental marks (next push = full): R: Call: TSC Reset Marks');P('');}
 if(pull.length){P('[Menu: TSC Pull Menu]','    Title: "Pull from server"');pull.forEach((e,i)=>P('    Key Item: Pull '+CORE_ENT[e].label+': '+keys[i]+': Call: TSC Pull '+e));P('    Key Item: Pull ALL (dependency order): P: Call: TSC Pull All','');}
 // variables
 const V=[['TSApiURL','String','"'+q(o.url)+'"'],['TSApiKey','String','"'+q(o.apiKey)+'"'],['TSCompanyCode','String','"'+q(o.company)+'"'],['TSGateCompany','String','"'+q(o.gateCompany)+'"'],['TSGateGSTIN','String','"'+q(o.gateGstin)+'"'],['TSBasicAuth','String','"'+q(o.basic)+'"']];
 if(o.dates)V.push(['TSFromDate','Date',o.fromDefault==='fy'?'##SVFromDate':'$$MonthStart:##SVCurrentDate'],['TSToDate','Date','$$MonthEnd:##SVCurrentDate']);
 push.forEach(e=>V.push(['TSCAlt'+e,'Number','0'],['TSCLogPush'+e,'String','"never"']));
 pull.forEach(e=>V.push(['TSCLogPull'+e,'String','"never"']));
 V.forEach(([n,t])=>P('[Variable: '+n+']','    Type: '+t,'    Persistent: Yes',''));
 const T=[['TSCMaxAlt','Number','0'],['TSCQuiet','Logical','No'],['TSCPullNo','String','""'],['TSCCreated','Number','0'],['TSCAltered','Number','0'],['TSCSkipped','Number','0'],['TSCErrors','Number','0']];
 T.forEach(([n,t])=>P('[Variable: '+n+']','    Type: '+t,'    Persistent: No',''));
 P('[System: Variable]');[...V,...T].forEach(([n,,v])=>P('    '+n+': '+v));P('');
 // formulas
 let f='"'+q(o.url)+'"';const rep=(t,x)=>{f=f.split(t).join('" + '+x+' + "')};
 rep('{company}','##TSCompanyCode');rep('{companyname}','##SVCurrentCompany');rep('{fromdate}','$$String:'+fromE+':UniversalDate');rep('{todate}','$$String:'+toE+':UniversalDate');
 f=f.replace(/ \+ ""/g,'').replace(/"" \+ /g,'');if(!/[{]/.test(o.url))f='##TSApiURL  ;; editable in Configuration screen';
 const sep=o.url.includes('?')?'&':'?';
 P('[System: Formula]','    TSCBase: '+f,'    TSCAuthQS: '+(o.auth==='query'?'"'+sep+'apikey=" + ##TSApiKey':'""'));
 P('    TSCGateOK: '+(o.gate==='name'?'$$IsEqual:##SVCurrentCompany:##TSGateCompany':o.gate==='gstin'?'$$IsEqual:##SVCurrentCompany:##TSGateCompany AND $$IsEqual:($GSTRegistrationNumber:Company:##SVCurrentCompany):##TSGateGSTIN  ;; GSTIN method name unverified':'Yes'));
 P('    TSCStamp: $$String:$$MachineDate + " " + $$String:$$MachineTime','');
 const hdrs=()=>{if(o.auth==='header')P('    Export Header: "x-api-key: " + ##TSApiKey');if(o.auth==='basic')P('    Export Header: "Authorization: Basic " + ##TSBasicAuth');};
 // config & dates screens
 const screen=(name,title,fields)=>{P('[Report: '+name+']','    Form: '+name,'    Title: "'+title+'"');fields.forEach(x=>P('    Variable: '+x[0]));P('');
  P('[Form: '+name+']','    Part: '+name,'    Width: 70% Screen','','[Part: '+name+']','    Lines: '+fields.map(x=>name+' '+x[0]).join(', '),'');
  fields.forEach(([v,lab,t])=>{P('[Line: '+name+' '+v+']','    Fields: Medium Prompt, '+name+' '+v+' Fld','    Local: Field: Medium Prompt: Info: "'+lab+'"','');
   P('[Field: '+name+' '+v+' Fld]','    Use: '+(t==='d'?'Uni Date Field':'Name Field'));if(t!=='d')P('    Max: 250');P('    Set As: ##'+v,'    Modifies: '+v+': Yes','');});};
 const cf=[['TSApiURL','Base URL'],['TSApiKey','API Key'],['TSCompanyCode','Company Code']];if(o.gate!=='none')cf.push(['TSGateCompany','Allowed Company'],['TSGateGSTIN','Allowed GSTIN']);if(o.auth==='basic')cf.push(['TSBasicAuth','Basic auth (base64)']);
 screen('TSC Config','Sync Configuration',cf);
 if(o.dates)screen('TSC Dates','Sync Date Range',[['TSFromDate','From','d'],['TSToDate','To','d']]);
 const gate=(S,what)=>{S('If: NOT @@TSCGateOK');S('Msg Box: "'+what+' blocked": "Open company does not match the configured company"');S('Return');S('End If');};
 const seq=()=>{let n=0;return s=>P('    '+String(n++).padStart(3,'0')+': '+s)};
 // ================= PUSH =================
 push.forEach(e=>{const E=CORE_ENT[e],col='TSC Col '+e,rq='TSC Req '+e,isV=E.kind==='vch';
  P('[Collection: '+col+']','    Type: '+(isV?'Voucher':E.type),'    Fetch: *.*');
  const fl=[];if(isV)fl.push('TSC Flt '+e,'TSC Flt Date');if(inc&&E.kind!=='stock')fl.push('TSC Flt Alt '+e);
  if(fl.length)P('    Filter: '+fl.join(', '));P('');
  P('[System: Formula]');if(isV)P('    TSC Flt '+e+': $VoucherTypeName = "'+E.vt+'" OR $$IsSysNameEqual:'+E.vt.replace(' ','')+':($Parent:VoucherType:$VoucherTypeName)  ;; covers custom types under '+E.vt);
  if(inc&&E.kind!=='stock')P('    TSC Flt Alt '+e+': $AlterID > ##TSCAlt'+e);P('');
  // request report
  P('[Report: '+rq+']','    Form: '+rq,'    Export: Yes','    Export Header: "Content-Type: application/xml"');hdrs();P('');
  P('[Form: '+rq+']','    Part: '+rq+' Hdr, '+rq+' Body','    XMLTag: "ENVELOPE"','');
  const hf=[fld('H','ENTITY','"'+e.toLowerCase()+'"'),fld('H','COMPANY','##TSCompanyCode'),fld('H','COMPANYNAME','##SVCurrentCompany'),fld('H','FROMDATE','$$String:'+fromE+':UniversalDate'),fld('H','TODATE','$$String:'+toE+':UniversalDate'),fld('H','COUNT','$$String:($$NumItems:'+col+')')];
  if(o.auth==='body')hf.push(fld('H','APIKEY','##TSApiKey'));
  P('[Part: '+rq+' Hdr]','    Line: '+rq+' Hdr','','[Line: '+rq+' Hdr]','    XMLTag: "HEADER"','    Fields: '+[...new Set(hf)].join(', '),'');
  P('[Part: '+rq+' Body]','    Line: '+rq+' Row','    Repeat: '+rq+' Row: '+col,'    Scroll: Vertical','');
  if(isV){P('[Line: '+rq+' Row]','    XMLTag: "VOUCHER"','    Fields: '+VF.map(([t,x])=>fld('V',t,x)).join(', '),'    Explode: TSC Inv Part: Yes','    Explode: TSC Led Part: Yes','');}
  else P('[Line: '+rq+' Row]','    XMLTag: "'+E.tag+'"','    Fields: '+MF[e].map(([t,x])=>fld(e,t,x)).join(', '),'');
  // functions
  let S=seq();P('[Function: TSC Push '+e+']');gate(S,'Push');
  if(inc&&E.kind!=='stock'){S('Set: TSCMaxAlt: ##TSCAlt'+e);S('Walk Collection: '+col);S('Set: TSCMaxAlt: if $AlterID > ##TSCMaxAlt then $AlterID else ##TSCMaxAlt');S('End Walk');}
  S('HTTP Request: @@TSCBase + "/push/'+e.toLowerCase()+'" + @@TSCAuthQS: POST: XML: ASCII: '+rq+': TSC After '+e);P('');
  S=seq();P('[Function: TSC After '+e+']','    Variable: vStatus: Number');S('Set: vStatus: 0');S('Walk Collection: Parameter Collection');S('Set: vStatus: $Status');S('End Walk');
  S('If: ##vStatus = 1');if(inc&&E.kind!=='stock')S('Set: TSCAlt'+e+': ##TSCMaxAlt');S('Set: TSCLogPush'+e+': @@TSCStamp + " | OK"');S('If: NOT ##TSCQuiet');S('Msg Box: "Push '+E.label+'": "Success"');S('End If');
  S('Else');S('Set: TSCLogPush'+e+': @@TSCStamp + " | FAILED (STATUS not 1)"');S('If: NOT ##TSCQuiet');S('Msg Box: "Push '+E.label+'": "Failed - nothing marked as synced"');S('End If');S('End If');P('');
 });
 if(push.some(e=>CORE_ENT[e].kind==='vch')){
  P('[Part: TSC Inv Part]','    Line: TSC Inv Line','    Repeat: TSC Inv Line: AllInventoryEntries','    Scroll: Vertical','',
   '[Line: TSC Inv Line]','    XMLTag: "INVENTORYENTRY"','    Fields: '+IF_.map(([t,x])=>fld('I',t,x)).join(', '),'    Explode: TSC Bat Part: Yes','    Explode: TSC Acc Part: Yes','',
   '[Part: TSC Bat Part]','    Line: TSC Bat Line','    Repeat: TSC Bat Line: BatchAllocations','    Scroll: Vertical','',
   '[Line: TSC Bat Line]','    XMLTag: "BATCH"','    Fields: '+BF.map(([t,x])=>fld('B',t,x)).join(', '),'',
   '[Part: TSC Acc Part]','    Line: TSC Acc Line','    Repeat: TSC Acc Line: AccountingAllocations','    Scroll: Vertical','',
   '[Line: TSC Acc Line]','    XMLTag: "ACCOUNTINGALLOCATION"','    Fields: '+AF.map(([t,x])=>fld('A',t,x)).join(', '),'',
   '[Part: TSC Led Part]','    Line: TSC Led Line','    Repeat: TSC Led Line: LedgerEntries','    Scroll: Vertical','',
   '[Line: TSC Led Line]','    XMLTag: "LEDGERENTRY"','    Fields: '+LF.map(([t,x])=>fld('L',t,x)).join(', '),'');
  P('[System: Formula]','    TSC Flt Date: $Date >= '+fromE+' AND $Date <= '+toE,'');
 }
 if(push.length){let S=seq();P('[Function: TSC Push All]');S('Set: TSCQuiet: Yes');push.forEach(e=>S('Call: TSC Push '+e));S('Set: TSCQuiet: No');S('Display: TSC Log');P('');
  if(inc){S=seq();P('[Function: TSC Reset Marks]');push.forEach(e=>S('Set: TSCAlt'+e+': 0'));S('Msg Box: "Reset": "Next push sends all records in range"');P('');}}
 // ================= PULL =================
 const pullCol=(name,path,url,fetch,filter)=>{P('[Collection: '+name+']','    Remote URL: @@TSCBase + "'+url+'" + @@TSCAuthQS','    XMLObjectPath: '+path+': 1: ENVELOPE','    Fetch: '+fetch);hdrs();if(filter)P('    Filter: '+filter);P('');};
 const counters=S=>{S('Set: TSCCreated: 0');S('Set: TSCAltered: 0');S('Set: TSCSkipped: 0');S('Set: TSCErrors: 0');};
 const summary=(S,e,label)=>{S('Set: TSCLogPull'+e+': @@TSCStamp + " | created " + $$String:##TSCCreated + ", altered " + $$String:##TSCAltered + ", skipped " + $$String:##TSCSkipped + ", errors " + $$String:##TSCErrors');
  S('If: NOT ##TSCQuiet');S('Msg Box: "Pull '+label+'": ##TSCLogPull'+e);S('End If');};
 const result=S=>{S('If: $$LastResult');S('If: ##vExists');S('Set: TSCAltered: ##TSCAltered + 1');S('Else');S('Set: TSCCreated: ##TSCCreated + 1');S('End If');S('Else');S('Set: TSCErrors: ##TSCErrors + 1');S('End If');};
 const MP={ // master pull: [fetch list, set-values (always), set-values (create only)]
  Groups:['NAME, PARENT',[['Parent','$PARENT']],[]],
  Ledgers:['NAME, PARENT, GSTIN, STATE, COUNTRY, PINCODE, EMAIL, MOBILE, ADDRESS1, ADDRESS2, OPENINGBALANCE',[['Parent','$PARENT'],['PartyGSTIN','$GSTIN'],['LedStateName','$STATE'],['CountryName','$COUNTRY'],['PinCode','$PINCODE'],['Email','$EMAIL'],['LedgerMobile','$MOBILE']],[['OpeningBalance','$$AsAmount:$OPENINGBALANCE']]],
  Units:['NAME, FORMALNAME, DECIMALPLACES',[['OriginalName','$FORMALNAME'],['DecimalPlaces','$$Number:$DECIMALPLACES']],[['IsSimpleUnit','Yes']]],
  Godowns:['NAME, PARENT',[['Parent','$PARENT']],[]],
  StockGroups:['NAME, PARENT',[['Parent','$PARENT']],[]],
  StockItems:['NAME, PARENT, CATEGORY, BASEUNITS, GSTAPPLICABLE, HSNCODE, GSTRATE, OPENINGQTY, OPENINGRATE, OPENINGVALUE',[['Parent','$PARENT'],['Category','$CATEGORY'],['BaseUnits','$BASEUNITS']],[['OpeningBalance','$$AsQty:$OPENINGQTY'],['OpeningRate','$$AsRate:$OPENINGRATE'],['OpeningValue','$$AsAmount:$OPENINGVALUE']]]};
 pull.forEach(e=>{const E=CORE_ENT[e];
  if(E.kind==='mst'){const [fe,always,create]=MP[e];pullCol('TSC Pull Col '+e,E.tag,'/pull/'+e.toLowerCase(),fe);
   const S=seq();P('[Function: TSC Pull '+e+']','    Variable: vExists: Logical');gate(S,'Pull');counters(S);
   S('Walk Collection: TSC Pull Col '+e);S('If: $$IsEmpty:$NAME');S('Set: TSCSkipped: ##TSCSkipped + 1');S('Continue');S('End If');
   S('Set: vExists: NOT $$IsEmpty:($Name:'+E.type+':$NAME)');
   S('New Object: '+E.type+': $NAME: Yes');S('Set Value: Name: $NAME');
   always.forEach(([k,v])=>{S('If: NOT $$IsEmpty:'+v.replace(/^\$\$\w+:/,''));S('Set Value: '+k+': '+v);S('End If');});
   if(create.length){S('If: NOT ##vExists');create.forEach(([k,v])=>{S('If: NOT $$IsEmpty:'+v.replace(/^\$\$\w+:/,''));S('Set Value: '+k+': '+v);S('End If');});
    if(e==='Ledgers'){S('If: NOT $$IsEmpty:$ADDRESS1');S('Insert Collection Object: Address');S('Set Value: Address: $ADDRESS1');S('Set Target: ..');S('End If');S('If: NOT $$IsEmpty:$ADDRESS2');S('Insert Collection Object: Address');S('Set Value: Address: $ADDRESS2');S('Set Target: ..');S('End If');}
    S('End If');}
   if(e==='StockItems'){S('If: NOT $$IsEmpty:$HSNCODE');S('Set Value: GSTApplicable: $$SysName:Applicable');S('Set Value: GSTTypeofSupply: "Goods"');S('Insert Collection Object: GSTDetails');
    S('Set Value: ApplicableFrom: ##SVFromDate');S('Set Value: HSNCode: $HSNCODE');S('Set Value: Taxability: "Taxable"');S('Insert Collection Object: StateWiseDetails');S('Set Value: StateName: $$SysName:Any');
    [['Central Tax','/ 2'],['State Tax','/ 2'],['Integrated Tax','']].forEach(([h,d])=>{S('Insert Collection Object: RateDetails');S('Set Value: GSTRateDutyHead: "'+h+'"');S('Set Value: GSTRateValuationType: "Based on Value"');S('Set Value: GSTRate: $$Number:$GSTRATE'+(d?' '+d:''));S('Set Target: ..');});
    S('Set Target: ..');S('Set Target: ..');S('End If');}
   S('Save Target');result(S);S('End Walk');summary(S,e,E.label);P('');}
  else { // vouchers: flat contract VOUCHER / ITEM / TAX rows linked by VOUCHERNUMBER
   const u='/pull/'+e.toLowerCase(),s=E.sales;
   pullCol('TSC Pull Col '+e,'VOUCHER',u,'VOUCHERNUMBER, DATE, PARTYNAME, REFERENCE, NARRATION, TOTAL');
   pullCol('TSC Pull Items '+e,'ITEM',u,'VOUCHERNUMBER, STOCKITEM, QTY, RATE, AMOUNT, GODOWN, BATCH, DUEDATE, LEDGER','TSC Flt PullNo');
   pullCol('TSC Pull Tax '+e,'TAX',u,'VOUCHERNUMBER, LEDGERNAME, AMOUNT','TSC Flt PullNo');
   P('[Collection: TSC Exists '+e+']','    Type: Voucher','    Fetch: VoucherNumber, VoucherTypeName','    Filter: TSC Flt Exists '+e,'');
   P('[System: Formula]','    TSC Flt Exists '+e+': $VoucherNumber = ##TSCPullNo AND $VoucherTypeName = "'+E.vt+'"','');
   const sg=s?'':'-1 * ',sgi=s?'':'-1 * ',party=s?'-1 * ':''; // sales: party Dr(-), items/tax Cr(+); purchase reversed
   const S=seq();P('[Function: TSC Pull '+e+']','    Variable: vExists: Logical','    Local Formula: TSCQty: $$AsQty:$QTY','    Local Formula: TSCRate: $$AsRate:$RATE');gate(S,'Pull');counters(S);
   S('Walk Collection: TSC Pull Col '+e);S('Set: TSCPullNo: $VOUCHERNUMBER');
   S('If: $$IsEmpty:##TSCPullNo OR $$NumItems:TSC Exists '+e+' > 0  ;; existing order numbers are skipped (no duplicates)');S('Set: TSCSkipped: ##TSCSkipped + 1');S('Continue');S('End If');
   S('Set: vExists: No');S('New Object: Voucher');S('Set Value: VoucherTypeName: "'+E.vt+'"');S('Set Value: Date: $$Date:$DATE');S('Set Value: VoucherNumber: $VOUCHERNUMBER');
   S('Set Value: PartyLedgerName: $PARTYNAME');S('Set Value: Reference: $REFERENCE');S('Set Value: Narration: $NARRATION');S('Set Value: PersistedView: $$SysName:InvoiceVoucherView');S('Set Value: IsInvoice: Yes');
   S('Insert Collection Object: LedgerEntries');S('Set Value: LedgerName: $PARTYNAME');S('Set Value: IsPartyLedger: Yes');S('Set Value: IsDeemedPositive: '+(s?'Yes':'No'));S('Set Value: Amount: '+party+'$$AsAmount:$TOTAL');S('Set Target: ..');
   S('Walk Collection: TSC Pull Items '+e);S('Insert Collection Object: AllInventoryEntries');S('Set Value: StockItemName: $STOCKITEM');S('Set Value: IsDeemedPositive: '+(s?'No':'Yes'));
   S('Set Value: Rate: $$TgtObject:@TSCRate');S('Set Value: BilledQty: $$TgtObject:@TSCQty');S('Set Value: ActualQty: $$TgtObject:@TSCQty');S('Set Value: Amount: '+sgi+'$$AsAmount:$AMOUNT');
   S('Insert Collection Object: BatchAllocations');S('Set Value: GodownName: if $$IsEmpty:$GODOWN then $$SysName:MainLocation else $GODOWN');S('Set Value: BatchName: if $$IsEmpty:$BATCH then $$SysName:PrimaryBatch else $BATCH');
   S('Set Value: OrderNo: $VOUCHERNUMBER');S('If: NOT $$IsEmpty:$DUEDATE');S('Set Value: OrderDueDate: $$Date:$DUEDATE');S('End If');
   S('Set Value: BilledQty: $$TgtObject:@TSCQty');S('Set Value: ActualQty: $$TgtObject:@TSCQty');S('Set Value: Amount: '+sgi+'$$AsAmount:$AMOUNT');S('Set Target: ..');
   S('Insert Collection Object: AccountingAllocations');S('Set Value: LedgerName: $LEDGER');S('Set Value: IsDeemedPositive: '+(s?'No':'Yes'));S('Set Value: Amount: '+sgi+'$$AsAmount:$AMOUNT');S('Set Target: ..');
   S('Set Target: ..');S('End Walk');
   S('Walk Collection: TSC Pull Tax '+e);S('Insert Collection Object: LedgerEntries');S('Set Value: LedgerName: $LEDGERNAME');S('Set Value: IsDeemedPositive: '+(s?'No':'Yes'));S('Set Value: Amount: '+sg+'$$AsAmount:$AMOUNT');S('Set Target: ..');S('End Walk');
   S('Save Target');result(S);S('End Walk');summary(S,e,E.label);P('');
  }});
 if(pull.some(e=>CORE_ENT[e].kind==='vch'))P('[System: Formula]','    TSC Flt PullNo: $VOUCHERNUMBER = ##TSCPullNo','');
 if(pull.length){const S=seq();P('[Function: TSC Pull All]');S('Set: TSCQuiet: Yes');pull.forEach(e=>S('Call: TSC Pull '+e));S('Set: TSCQuiet: No');S('Display: TSC Log');P('');}
 // ================= LOG =================
 const rows=[...push.map(e=>['Push','TSCLogPush'+e,e]),...pull.map(e=>['Pull','TSCLogPull'+e,e])];
 P('[Report: TSC Log]','    Form: TSC Log','    Title: "Sync Log"','','[Form: TSC Log]','    Part: TSC Log','    Width: 90% Screen','','[Part: TSC Log]','    Lines: '+(rows.length?rows.map(r=>'TSC Log '+r[1]).join(', '):'TSC Log Empty'),'');
 if(!rows.length)P('[Line: TSC Log Empty]','    Field: Medium Prompt','    Local: Field: Medium Prompt: Info: "Nothing selected"','');
 rows.forEach(([d,v,e])=>P('[Line: TSC Log '+v+']','    Fields: Medium Prompt, TSC Log '+v+' Fld','    Local: Field: Medium Prompt: Info: "'+d+' '+CORE_ENT[e].label+'"','','[Field: TSC Log '+v+' Fld]','    Use: Name Field','    Set As: ##'+v,'    Full Width: Yes',''));
 // fields
 const seen={};FIELDS.forEach(([n,t,x])=>{if(seen[n])return;seen[n]=1;P('[Field: '+n+']','    Use: Name Field','    Set As: '+x,'    XMLTag: "'+t+'"','');});
 return L.join('\r\n')+'\r\n';
}
if(typeof module!=='undefined')module.exports={genCore,CORE_ENT,CORE_ORDER,CORE_PULLABLE};
