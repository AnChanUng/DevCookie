import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {MemoryRouter} from 'react-router-dom';
import {createServer} from 'vite';
const saved=new Map();
globalThis.localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
globalThis.window=new EventTarget();window.location={href:'http://localhost/chanung',origin:'http://localhost'};
globalThis.document={getElementById:()=>({scrollIntoView(){}})};
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
let view;
try {
 const {default:Page}=await server.ssrLoadModule('/src/pages/ChanungPage.jsx');
 const {default:api}=await server.ssrLoadModule('/src/api.js');api.get=async()=>({data:{available:true}});
 const mount=async path=>{if(view)await act(()=>view.unmount());await act(()=>{view=TestRenderer.create(React.createElement(MemoryRouter,{initialEntries:[path]},React.createElement(Page)));});};
 for(const path of ['/chanung','/chanung?version=20261103_ver1']) {
  await mount(path);
  assert.equal(view.root.findAllByProps({id:'cu-intro'}).length,1);
  await act(()=>view.root.findByProps({'aria-label':'자기소개 학습 완료'}).props.onChange());
  assert.equal(view.root.findAllByProps({id:'cu-intro'}).length,0);
  await mount(path);
  assert.equal(view.root.findAllByProps({id:'cu-intro'}).length,0,'completed remains hidden after reload');
  const toggle=view.root.findAllByType('input').find(n=>n.props.type==='checkbox' && n.parent.children.some(c=>typeof c==='string'&&c.includes('완료한 답변도 표시')));
  assert.ok(toggle);assert.equal(toggle.props.checked,false);
  await act(()=>toggle.props.onChange({target:{checked:true}}));
  assert.equal(view.root.findByProps({'aria-label':'자기소개 학습 완료'}).props.checked,true);
 }
 console.log('PASS: latest and archived completion hides immediately and after reload; explicit show restores checked card');
} finally {if(view)await act(()=>view.unmount());await server.close();}
