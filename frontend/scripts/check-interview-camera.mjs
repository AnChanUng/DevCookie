import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import {createServer} from 'vite';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
let stopped=0,pending,view;
const stream=()=>({getTracks:()=>[{stop:()=>stopped++}]});
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:async options=>{assert.equal(options.audio,false);return stream();}}}});
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
 const {default:Camera}=await server.ssrLoadModule('/src/components/InterviewCamera.jsx');
 const mount=async()=>{await act(async()=>{view=TestRenderer.create(React.createElement(Camera),{createNodeMock:()=>({srcObject:null,play:async()=>{}})});});};
 const click=async()=>{await act(async()=>view.root.findByType('button').props.onClick());};
 await mount();assert.equal(view.root.findByType('video').props.hidden,false);await click();assert.ok(stopped);assert.equal(view.root.findByType('video').props.hidden,true);
 await click();const before=stopped;await act(async()=>view.unmount());view=null;assert.ok(stopped>before);
 navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{pending=resolve;});
 await mount();await click();const prior=stopped;await act(async()=>pending(stream()));assert.equal(stopped,prior+1);assert.equal(view.root.findByType('video').props.hidden,true);
 navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('denied','NotAllowedError');};await click();assert.ok(view.root.findByProps({role:'alert'}));
 console.log('PASS: camera preview, stop/unmount, late permission cancellation, permission denial');
}finally{if(view)await act(async()=>view.unmount());await server.close();}
