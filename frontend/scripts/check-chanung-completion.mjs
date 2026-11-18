import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { createServer } from 'vite';
const values = new Map();
globalThis.localStorage = { getItem:k=>values.get(k)??null, setItem:(k,v)=>values.set(k,String(v)), removeItem:k=>values.delete(k) };
globalThis.window = new EventTarget();
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
const users={A:{id:1,nickname:'A',token:'A'},B:{id:2,nickname:'B',token:'B'}};
const remote={A:{completed:{}},B:{completed:{}}};
const login=u=>{if(u)localStorage.setItem('sync:account',JSON.stringify(u));else localStorage.removeItem('sync:account');};
let view, progress, offline=false, hold=null;
const settle=()=>new Promise(r=>setTimeout(r,25));
try {
  const {default:api}=await server.ssrLoadModule('/src/api.js');
  const {default:useProgress,mergeCompletion}=await server.ssrLoadModule('/src/hooks/useChanungCompletion.js');
  api.defaults.adapter=async config=>{
    const token=config.headers.Authorization.replace('Bearer ','');
    if(hold && config.method==='get')await hold;
    if(offline)throw Object.assign(new Error('offline'),{response:{status:400}});
    if(config.method==='put'){
      const next=JSON.parse(JSON.parse(config.data).data);
      remote[token]={completed:mergeCompletion(remote[token].completed,next.completed)};
    }
    return {data:{data:JSON.stringify(remote[token])},status:200,headers:{},config};
  };
  function Probe({user}){progress=useProgress(user,['one','two','three']);return React.createElement('div',null,progress.status);}
  const mount=async user=>{login(user);await act(async()=>{view=TestRenderer.create(React.createElement(Probe,{user}));await settle();});};
  const unmount=async()=>{await act(()=>view.unmount());view=null;};
  localStorage.setItem('chanung:practice:v1:guest:completed',JSON.stringify(['one']));
  await mount(null);assert.ok(progress.completed.includes('one'),'legacy guest migrated');
  await act(()=>progress.toggle('two'));await unmount();await mount(null);
  assert.deepEqual(progress.completed.sort(),['one','two'],'guest survives remount');
  await unmount();
  localStorage.setItem('chanung:practice:v1:user:1:completed',JSON.stringify(['one']));
  remote.A.completed.two={done:true,at:2};
  await mount(users.A);
  assert.deepEqual(progress.completed.sort(),['one','two'],'legacy account and remote merge');
  assert.equal(progress.status,'saved');
  await act(async()=>{progress.toggle('one');await settle();});
  assert.equal(remote.A.completed.one.done,false,'uncheck saved as tombstone');
  await unmount();
  values.delete('chanung:practice:v1:user:1:completed:v2');
  values.delete('chanung:practice:v1:user:1:completed');
  await mount({...users.A,token:'A'});
  assert.deepEqual(progress.completed,['two'],'fresh local session restores server');
  await unmount();await mount(users.B);
  assert.deepEqual(progress.completed,[],'account isolation');
  await unmount();await mount(users.A);
  let release;hold=new Promise(r=>release=r);
  await act(()=>{window.dispatchEvent(new Event('focus'));});
  await act(()=>progress.toggle('three'));
  await act(async()=>{hold=null;release();await settle();});
  assert.ok(progress.completed.includes('three'),'click during fetch survives');
  assert.equal(remote.A.completed.three.done,true);
  offline=true;
  await act(async()=>{progress.toggle('two');await settle();});
  assert.equal(progress.status,'error');assert.ok(!progress.completed.includes('two'));
  offline=false;
  await act(async()=>{window.dispatchEvent(new Event('online'));await settle();});
  assert.equal(progress.status,'saved');assert.equal(remote.A.completed.two.done,false);
  remote.A.completed.one={done:true,at:Date.now()+100};
  await act(async()=>{window.dispatchEvent(new Event('focus'));await settle();});
  assert.ok(progress.completed.includes('one'),'another device refreshes on focus');
  console.log('PASS: completion migration, guest reopen, server restore, unchecked state, account isolation, in-flight edits, offline retry, peer refresh');
} finally {if(view)await act(()=>view.unmount());await server.close();}
