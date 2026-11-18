import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {createServer} from 'vite';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
globalThis.sessionStorage=globalThis.localStorage;
globalThis.window=Object.assign(new EventTarget(),{location:{origin:'http://test.invalid',host:'test.invalid'}});
globalThis.document=Object.assign(new EventTarget(),{hidden:false});
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
let view;
const text=n=>typeof n==='string'?n:(n?.children||[]).map(text).join('');
try {
 const {default:api}=await server.ssrLoadModule('/src/api.js');
 const {TOPICS}=await server.ssrLoadModule('/src/data/topicBank.js');
 const {default:Duel}=await server.ssrLoadModule('/src/pages/DuelPage.jsx');
 const ids=TOPICS.questions.slice(0,3).map(q=>q.id);
 let players=[{nickname:'나',me:true,score:0,answered:0,seconds:0,started:false,done:false}];
 let joined=false;
 api.defaults.adapter=async config=>{
  if(config.url.endsWith('/join'))joined=true;
  const data=config.url==='/duels/record'?{wins:2,losses:1,draws:1,total:4,recent:[]}:
   config.url==='/duels/open'?[]:{questionIds:ids,players,open:false};
  return {data,status:200,statusText:'OK',headers:{},config};
 };
 const mount=async path=>{
  if(view)await act(()=>view.unmount());
  await act(()=>{view=TestRenderer.create(React.createElement(MemoryRouter,{initialEntries:[path]},React.createElement(Routes,null,React.createElement(Route,{path:'/duel/:code?',element:React.createElement(Duel)}))));});
 };
 await mount('/duel/ABC234');
 assert.ok(joined);
 assert.ok(text(view.toJSON()).includes('시작하기'));
 assert.ok(text(view.toJSON()).includes('대기 중'));
 for(const [score,seconds,label] of [[3,20,'승리했습니다!'],[1,20,'아쉽게 패배했습니다'],[2,30,'무승부입니다!']]){
  players=[{nickname:'나',me:true,score,seconds,answered:3,done:true,started:true},{nickname:'상대',me:false,score:2,seconds:30,answered:3,done:true,started:true}]
   .sort((a,b)=>b.score-a.score||a.seconds-b.seconds);
  await mount('/duel/ABC234');
  assert.ok(text(view.toJSON()).includes(label),label);
 }
 await mount('/duel');
 assert.ok(text(view.toJSON()).includes('나의 누적 전적'));
 assert.ok(text(view.toJSON()).includes('50%'));
 console.log('Duel passed: auto-join without starting, waiting participant, win/loss/draw results, cumulative record and win rate.');
}finally{if(view)await act(()=>view.unmount());await server.close();}
