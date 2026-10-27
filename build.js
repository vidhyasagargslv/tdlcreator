const fs=require('fs');const js=fs.readFileSync('gen.js','utf8')+'\n'+fs.readFileSync('core.js','utf8');
fs.writeFileSync('index.html',fs.readFileSync('template.html','utf8').replace('/*GEN*/',()=>js));console.log('index.html built');
