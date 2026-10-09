// _scripts/dupkeys.cjs — deteta chaves duplicadas em objetos JS (causa do F1, Lote A 08/10/2026). Uso na raiz: node _scripts/dupkeys.cjs js/*.js
const acorn=require(process.cwd()+'/node_modules/acorn');const fs=require('fs');
for(const f of process.argv.slice(2)){const src=fs.readFileSync(f,'utf8');let ast;try{ast=acorn.parse(src,{ecmaVersion:2022,locations:true,allowHashBang:true});}catch(e){console.log(f,'PARSE',e.message);continue}
let n=0;(function walk(o){if(!o||typeof o!=='object')return;if(Array.isArray(o)){o.forEach(walk);return}
if(o.type==='ObjectExpression'){const seen={};for(const p of o.properties){if(p.type!=='Property'||p.computed)continue;const k=p.key.name||p.key.value;if(seen[k]){console.log(f,'DUP',k,'l.'+seen[k],'& l.'+p.loc.start.line);n++}else seen[k]=p.loc.start.line}}
for(const k in o)if(k!=='loc')walk(o[k])})(ast);if(!n)console.log(f,'ok')}
