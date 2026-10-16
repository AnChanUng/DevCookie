import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v))};};
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.localStorage=memory();globalThis.sessionStorage=memory();
globalThis.window=Object.assign(new EventTarget(),{location:{host:'test.invalid'}});
globalThis.document=Object.assign(new EventTarget(),{hidden:false,referrer:''});
const RealDate=Date;
let now=RealDate.parse('2026-10-16T14:59:59Z');
globalThis.Date=class extends RealDate {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};
class Stream {
 static instances=[];
 constructor(url){this.url=url;this.listeners={};Stream.instances.push(this);}
 addEventListener(name,callback){this.listeners[name]=callback;}
 emit(data){this.listeners.messages({data:JSON.stringify(data)});}
 close(){this.closed=true;}
}
globalThis.EventSource=Stream;
const originalError=console.error,errors=[];
console.error=(...a)=>{if(!String(a[0]).startsWith('react-test-renderer is deprecated'))errors.push(a.join(' '));};
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
let view;
const text=n=>typeof n==='string'?n:(n?.children||[]).map(text).join('');
const originalTimeout=setTimeout;
let midnight;
try {
 const {default:api}=await server.ssrLoadModule('/src/api.js');
 let deferred;
 const posts=[];
 api.defaults.adapter=async config=>{
  if(config.method==='post') {posts.push(JSON.parse(config.data));return new Promise((resolve,reject)=>{deferred={resolve:data=>resolve({data,status:200,statusText:'OK',headers:{},config}),reject};});}
  return {data:{messages:[],epoch:1,online:2},status:200,statusText:'OK',headers:{},config};
 };
 const {default:Chat}=await server.ssrLoadModule('/src/components/LoungeChat.jsx');
 globalThis.setTimeout=(fn,delay,...args)=>{const id=originalTimeout(fn,delay,...args);if(delay===1000)midnight={fn,id};return id;};
 const props={open:true,online:2,onOnline(){},onUnread(){},onClose(){}};
 await act(()=>{view=TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(Chat,props)));});
 const stream=Stream.instances.at(-1);assert.ok(stream.url.endsWith('/lounge/stream'));
 const input=()=>view.root.findByProps({'aria-label':'메시지'});
 const send=async value=>{await act(()=>input().props.onChange({target:{value}}));await act(()=>view.root.findByProps({className:'lounge-form'}).props.onSubmit({preventDefault(){}}));};
 await send('즉시 보이기');
 assert.ok(text(view.toJSON()).includes('전송 중…'));assert.ok(text(view.toJSON()).includes('즉시 보이기'));assert.equal(input().props.value,'');
 const posted=posts[0];
 await act(()=>deferred.reject(new Error('network')));
 assert.ok(text(view.toJSON()).includes('전송 실패'));
 await act(()=>{view.root.findAllByType('button').find(b=>text(b)==='재시도').props.onClick();});
 assert.equal(posts[1].clientId,posted.clientId,'retry uses the same idempotency key');
 await act(()=>input().props.onChange({target:{value:'작성 중인 다음 글'}}));
 const confirmed={id:1,clientId:posted.clientId,nickname:posted.nickname,visitor:posted.visitorId.slice(0,8),text:posted.text,at:new Date().toISOString()};
 await act(()=>stream.emit({messages:[confirmed],epoch:1,online:2}));
 assert.equal(view.root.findAllByProps({className:'lounge-bubble'}).length,1,'stream echo replaces optimistic bubble');
 await act(()=>deferred.resolve(confirmed));
 assert.equal(view.root.findAllByProps({className:'lounge-bubble'}).length,1,'HTTP confirmation is deduplicated');
 assert.equal(input().props.value,'작성 중인 다음 글');
 // A stream-confirmed send stays successful even if its HTTP response is lost.
 await send('응답만 유실');
 const second={...confirmed,id:2,clientId:posts.at(-1).clientId,text:'응답만 유실'};
 await act(()=>stream.emit({messages:[confirmed,second],epoch:1,online:2}));
 await act(()=>deferred.reject(new Error('response lost')));
 assert.equal(view.root.findAllByProps({role:'alert'}).length,0);
 // Server-pushed deletion applies immediately.
 await act(()=>stream.emit({messages:[],epoch:2,online:2}));
 assert.equal(view.root.findAllByProps({className:'lounge-bubble'}).length,0);
 await act(()=>stream.emit({messages:[confirmed],epoch:3,online:2}));
 assert.ok(midnight,'midnight timer scheduled in Korean time');
 clearTimeout(midnight.id);now+=2000;
 await act(()=>midnight.fn());
 assert.equal(view.root.findAllByProps({className:'lounge-bubble'}).length,0,'yesterday disappears at midnight without waiting for server');
 await act(()=>stream.onerror());
 await act(()=>view.unmount());view=null;assert.ok(stream.closed);
 assert.deepEqual(errors,[]);
 console.log('Lounge passed: immediate pending display, failure/retry, idempotency key reuse, SSE/HTTP deduplication, draft preservation, live deletion, Korean midnight, disconnect cleanup. No live network.');
} finally {
 if(view)await act(()=>view.unmount());
 await server.close();console.error=originalError;globalThis.Date=RealDate;globalThis.setTimeout=originalTimeout;
}
