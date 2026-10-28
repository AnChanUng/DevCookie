import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import {MemoryRouter} from 'react-router-dom';
import {createServer} from 'vite';
import {existsSync} from 'node:fs';
const values=new Map();
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
globalThis.window=new EventTarget();
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
let view;const errors=[],originalError=console.error;
console.error=(...a)=>{if(!String(a[0]).startsWith('react-test-renderer is deprecated'))errors.push(a.join(' '));};
const text=n=>typeof n==='string'?n:(n?.children||[]).map(text).join('');
try{
 const {default:api}=await server.ssrLoadModule('/src/api.js');
 const {default:Page}=await server.ssrLoadModule('/src/pages/MajorPage.jsx');
 let tier='BRONZE',fail=false;const requests=[];
 api.defaults.adapter=async config=>{
  requests.push(config);
  if(fail)throw Object.assign(new Error('duplicate'),{response:{status:409,data:{error:'이미 사용 중인 닉네임입니다.'}}});
  const data=config.url.startsWith('/theory/notes/')?new Blob(['%PDF-1.4 test fixture'],{type:'application/pdf'}):config.url==='/auth/nickname'?{nickname:JSON.parse(config.data).nickname}:{tier,solvedCount:0};
  return {data,status:200,statusText:'OK',headers:{},config};
 };
 for(tier of [null,'BRONZE','SILVER','GOLD','DIAMOND','RUBY']){
  if(tier)localStorage.setItem('sync:account',JSON.stringify({nickname:'viewer',token:'viewer-token'}));
  else localStorage.removeItem('sync:account');
  requests.length=0;
  await act(async()=>{view=TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(Page)));});
  assert.ok(text(view.toJSON()).includes('필기이론'));
  assert.ok(text(view.toJSON()).includes('요약노트 제공 일시 중단'));
  assert.equal(view.root.findAllByType('iframe').length,0);
  assert.equal(view.root.findAllByProps({className:'note-open'}).length,0);
  assert.equal(view.root.findAllByProps({className:'note-dl'}).length,0);
  assert.equal(requests.length,0,'paused page must not fetch any PDFs or membership');
  await act(()=>view.unmount());view=null;
 }
 const {changeNickname}=await server.ssrLoadModule('/src/sync.js');
 localStorage.setItem('sync:account',JSON.stringify({nickname:'before',token:'same-token'}));
 fail=true;
 await assert.rejects(changeNickname('duplicate'));
 assert.equal(JSON.parse(localStorage.getItem('sync:account')).nickname,'before');
 fail=false;await changeNickname('after');
 assert.deepEqual(JSON.parse(localStorage.getItem('sync:account')),{nickname:'after',token:'same-token'});
 assert.equal(requests.at(-1).headers.Authorization,'Bearer same-token');
 for(const file of ['ipe-written-summary.pdf','ipe-written-review.pdf','sqld-concepts.pdf','ipe-silgi-theory.pdf','adsp-summary.pdf','bigdata-analyst-summary.pdf']){
  assert.equal(existsSync(`public/notes/${file}`),false,'no static public PDF copies');
  assert.equal(existsSync(`../backend/src/main/resources/private-notes/${file}`),false,'PDF must not be bundled in the backend');
 }
 assert.deepEqual(errors,[]);
 console.log('Membership passed: PDFs unavailable for guests and all five tiers, no document fetches or embeds, no packaged PDFs, nickname uniqueness and stable identity. No live network.');
}finally{if(view)await act(()=>view.unmount());await server.close();console.error=originalError;}
