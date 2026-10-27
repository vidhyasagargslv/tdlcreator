// TDL Maker mock backend - no dependencies. node server.js  (PORT=8787 MOCK_KEY=test-key)
const http=require('http'),fs=require('fs'),path=require('path'),url=require('url');
const PORT=+process.env.PORT||8787,KEY=process.env.MOCK_KEY||'test-key',FAIL=process.env.MOCK_FAIL==='1';
const RECV=path.join(__dirname,'received');fs.mkdirSync(RECV,{recursive:true});
const PUSH=['groups','ledgers','units','godowns','stockgroups','stockitems','closingstock','salesorders','purchaseorders'];
const ROW={groups:'GROUP',ledgers:'LEDGER',units:'UNIT',godowns:'GODOWN',stockgroups:'STOCKGROUP',stockitems:'STOCKITEM',closingstock:'STOCKITEM',salesorders:'VOUCHER',purchaseorders:'VOUCHER'};
const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);
const reply=(res,status,msg)=>{res.writeHead(200,{'Content-Type':'application/xml'});res.end(`<ENVELOPE><STATUS>${status}</STATUS><MESSAGE>${String(msg).replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"})[c])}</MESSAGE></ENVELOPE>`)};
const decode=b=>(b[0]===0xff&&b[1]===0xfe)||(b.length>1&&b[1]===0)?b.toString('utf16le').replace(/^\ufeff/,''):b.toString('utf8');
const count=(x,t)=>(x.match(new RegExp('<'+t+'>','g'))||[]).length;
http.createServer((req,res)=>{const u=url.parse(req.url,true),parts=u.pathname.split('/').filter(Boolean);const chunks=[];
 req.on('data',c=>chunks.push(c));req.on('end',()=>{const body=decode(Buffer.concat(chunks));
  const key=req.headers['x-api-key']||u.query.apikey||(body.match(/<APIKEY>([^<]*)<\/APIKEY>/)||[])[1]||(req.headers.authorization?'basic':'');
  if(parts[0]==='push'){const ent=parts[1];const f=path.join(RECV,`${ent}-${Date.now()}.xml`);fs.writeFileSync(f,body);
   const errs=[];if(!PUSH.includes(ent))errs.push('unknown entity');if(!/<ENVELOPE>/.test(body))errs.push('no <ENVELOPE>');if(!/<HEADER>/.test(body))errs.push('no <HEADER>');
   if(key!==KEY&&key!=='basic')errs.push('bad api key ('+(key||'none')+')');
   const n=count(body,ROW[ent]||'X'),hc=(body.match(/<COUNT>\s*(\d+)/)||[])[1];
   if(ROW[ent]==='VOUCHER'){const inv=count(body,'INVENTORYENTRY'),led=count(body,'LEDGERENTRY');log(`  ${n} vouchers, ${inv} inventory entries, ${led} ledger entries`);}
   log(`PUSH ${ent}: ${n} rows (header COUNT ${hc}) -> ${path.basename(f)} ${errs.length?'ERR '+errs.join('; '):'OK'}`);
   return reply(res,FAIL||errs.length?0:1,errs.join('; ')||`received ${n}`);}
  if(parts[0]==='pull'){const ent=parts[1],f=path.join(__dirname,'samples',ent+'.xml');
   if(key!==KEY&&key!=='basic')log(`PULL ${ent}: WARNING bad/missing api key (${key||'none'}) - serving anyway`);
   if(!fs.existsSync(f)){log('PULL '+ent+': no sample');res.writeHead(404);return res.end('<ENVELOPE></ENVELOPE>');}
   log('PULL '+ent+': served samples/'+ent+'.xml');res.writeHead(200,{'Content-Type':'application/xml'});return res.end(fs.readFileSync(f));}
  res.writeHead(200,{'Content-Type':'text/plain'});res.end('TDL Maker mock server. Received files:\n'+fs.readdirSync(RECV).join('\n'));});
}).listen(PORT,'0.0.0.0',()=>log(`mock server on http://0.0.0.0:${PORT}  key=${KEY}  fail=${FAIL}`));
