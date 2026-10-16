import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {createServer} from 'vite';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const sources=[];
class Source {
  constructor(url){this.url=url;this.listeners=new Map();sources.push(this);}
  addEventListener(name,listener){this.listeners.set(name,listener);}
  removeEventListener(name){this.listeners.delete(name);}
  close(){this.closed=true;}
  emit(data){this.listeners.get('promotion')?.({data:typeof data==='string'?data:JSON.stringify(data)});}
}
globalThis.EventSource=Source;
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
const original=console.error,errors=[];
console.error=(...args)=>{if(!String(args[0]).startsWith('react-test-renderer is deprecated'))errors.push(args.join(' '));};
let view;
const text=node=>typeof node==='string'?node:(Array.isArray(node)?node:node?.children||[]).map(text).join('');
try{
 const {default:Notice}=await server.ssrLoadModule('/src/components/PromotionAnnouncements.jsx');
 await act(()=>{view=TestRenderer.create(React.createElement(React.Fragment,null,React.createElement(Notice),React.createElement(Notice)));});
 assert.equal(sources.length,2);assert.ok(sources.every(s=>s.url.endsWith('/promotions/stream')));
 await act(()=>sources.forEach(s=>s.emit({id:'notice-1',nickname:'다른사람',tierName:'다이아 Ⅴ'})));
 assert.equal(view.root.findAllByProps({role:'status'}).length,2);
 assert.ok(text(view.toJSON()).includes('다른사람님이 다이아 Ⅴ로 승급했습니다'));
 await act(()=>sources.forEach(s=>s.emit({id:'notice-1',nickname:'다른사람',tierName:'다이아 Ⅴ'})));
 assert.equal(view.root.findAllByProps({role:'status'}).length,2);
 await act(()=>sources.forEach(s=>{s.emit('invalid-json');s.emit({id:'bad'});}));
 assert.equal(view.root.findAllByProps({role:'status'}).length,2);
 await act(()=>view.root.findAllByType('button').forEach(b=>b.props.onClick()));
 assert.equal(view.root.findAllByProps({role:'status'}).length,0);
 await act(()=>view.unmount());view=null;
 assert.ok(sources.every(s=>s.closed));assert.deepEqual(errors,[]);
 console.log('Promotion announcements passed: two live viewers see another person, duplicate/malformed events ignored, dismiss and disconnect cleanup.');
}finally{if(view)await act(()=>view.unmount());await server.close();console.error=original;}
