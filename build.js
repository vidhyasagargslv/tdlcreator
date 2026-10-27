const fs=require('fs');fs.writeFileSync('index.html',fs.readFileSync('template.html','utf8').replace('/*GEN*/',()=>fs.readFileSync('gen.js','utf8')));console.log('index.html built');
