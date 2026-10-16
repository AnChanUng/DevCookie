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
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
let view;const errors=[],originalError=console.error;
console.error=(...a)=>{if(!String(a[0]).startsWith('react-test-renderer is deprecated'))errors.push(a.join(' '));};
const text=n=>typeof n==='string'?n:(n?.children||[]).map(text).join('');
try{
 const {default:api}=await server.ssrLoadModule('/src/api.js');
 const {default:Gate}=await server.ssrLoadModule('/src/components/GoldGate.jsx');
 let tier='BRONZE',fail=false;const requests=[];
 api.defaults.adapter=async config=>{
  requests.push(config);
  if(fail)throw Object.assign(new Error('duplicate'),{response:{status:409,data:{error:'이미 사용 중인 닉네임입니다.'}}});
  const data=config.url==='/auth/nickname'?{nickname:JSON.parse(config.data).nickname}:{tier,solvedCount:0};
  return {data,status:200,statusText:'OK',headers:{},config};
 };
 for(tier of ['BRONZE','SILVER','GOLD','DIAMOND','RUBY']){
  await act(async()=>{view=TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(Gate,null,React.createElement('div',null,'protected-content'))));});
  assert.equal(text(view.toJSON()).includes('protected-content'),['GOLD','DIAMOND','RUBY'].includes(tier));
  await act(()=>view.unmount());view=null;
 }
 fail=true;
 await act(async()=>{view=TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(Gate,null,'protected-content')));});
 assert.ok(text(view.toJSON()).includes('등급을 확인하지 못했습니다.'));assert.ok(!text(view.toJSON()).includes('protected-content'));
 await act(()=>view.unmount());view=null;
 const {changeNickname}=await server.ssrLoadModule('/src/sync.js');
 localStorage.setItem('sync:account',JSON.stringify({nickname:'before',token:'same-token'}));
 await assert.rejects(changeNickname('duplicate'));
 assert.equal(JSON.parse(localStorage.getItem('sync:account')).nickname,'before');
 fail=false;await changeNickname('after');
 assert.deepEqual(JSON.parse(localStorage.getItem('sync:account')),{nickname:'after',token:'same-token'});
 assert.equal(requests.at(-1).headers.Authorization,'Bearer same-token');
 for(const file of ['sqld-concepts.pdf','ipe-silgi-theory.pdf','adsp-summary.pdf','bigdata-analyst-summary.pdf']){
  assert.equal(existsSync(`public/notes/${file}`),false,'no public PDF bypass');
  assert.ok(existsSync(`../backend/src/main/resources/private-notes/${file}`));
 }
 assert.deepEqual(errors,[]);
 console.log('Membership passed: all five tier gates, network failure blocks access, duplicate nickname preserves identity, successful rename preserves token, private PDF packaging. No live network.');
}finally{if(view)await act(()=>view.unmount());await server.close();console.error=originalError;}
