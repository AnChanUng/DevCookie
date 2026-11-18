import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const css=readFileSync('src/index.css','utf8');
const lum=hex=>{const a=hex.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
const ratio=(a,b)=>{a=lum(a);b=lum(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
for(const theme of ['warm-gray','soft-charcoal']){
 const block=css.split(`:root[data-theme='${theme}'] {`).at(-1).split('}')[0];
 const vars=Object.fromEntries([...block.matchAll(/--([\w-]+): (#[\da-fA-F]{6});/g)].map(m=>[m[1],m[2]]));
 let min=100;
 for(const fg of ['text-primary','text-secondary','text-tertiary','text-quaternary','accent-blue','accent-green','accent-orange','accent-red','accent-purple','accent-cyan'])for(const bg of ['bg-primary','bg-secondary','bg-tertiary']){const r=ratio(vars[fg],vars[bg]);assert.ok(r>=4.5,`${theme} ${fg}/${bg} ${r}`);min=Math.min(min,r);}
 for(const fg of ['code-text','code-ln','code-kw','code-str','code-num','code-com','code-ann'])assert.ok(ratio(vars[fg],vars['code-bg'])>=4.5,`${theme} ${fg}`);
 const root={dataset:{}};vm.runInNewContext(readFileSync('public/theme-init.js','utf8'),{localStorage:{getItem:()=>theme},document:{documentElement:root}});assert.equal(root.dataset.theme,theme);assert.equal(root.dataset.mode,theme==='soft-charcoal'?'dark':undefined);
 console.log(`${theme}: text/surface minimum ${min.toFixed(2)}:1; syntax and saved-theme initialization passed`);
}
for(const bg of ['#326B65','#285952'])assert.ok(ratio('#FFFFFF',bg)>=4.5);
