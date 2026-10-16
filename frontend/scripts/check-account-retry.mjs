import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { createServer } from 'vite';
import { MemoryRouter } from 'react-router-dom';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};};
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.localStorage=memory();globalThis.sessionStorage=memory();
globalThis.window=Object.assign(new EventTarget(),{location:{search:'',pathname:'/account/retry',host:'test.invalid'},scrollTo(){},matchMedia:()=>({matches:false})});
globalThis.document=Object.assign(new EventTarget(),{referrer:''});
const originalError=console.error,errors=[];
console.error=(...a)=>{if(!String(a[0]).startsWith('react-test-renderer is deprecated'))errors.push(a.join(' '));};
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
let view;
const text=n=>typeof n==='string'?n:(n?.children||[]).map(text).join('');
const button=label=>view.root.findAllByType('button').findLast(b=>text(b)===label);
const click=async b=>{assert.ok(b,'button exists');assert.ok(!b.props.disabled);await act(()=>b.props.onClick());};
try {
 const {ACCOUNT_BANKS}=await server.ssrLoadModule('/src/accountRecords.js');
 const {allQuestions}=await server.ssrLoadModule('/src/data/examQuestions.js');
 const {buildAccountRetry}=await server.ssrLoadModule('/src/accountRetry.js');
 let pair;
 for(const a of ACCOUNT_BANKS){for(const b of ACCOUNT_BANKS){if(a===b)continue;const q=allQuestions(a).find(q=>!q.kind&&allQuestions(b).some(r=>!r.kind&&r.id===q.id));if(q){pair=[[a,q],[b,allQuestions(b).find(r=>r.id===q.id)]];break;}}if(pair)break;}
 assert.ok(pair,'exercise equal IDs across banks');
 const short=ACCOUNT_BANKS.find(b=>b.key==='ibkit'),essay=ACCOUNT_BANKS.find(b=>b.key==='pearl');
 const chosen=[...pair,[short,allQuestions(short).find(q=>q.kind==='short')],[essay,allQuestions(essay).find(q=>q.kind==='essay')]];
 const records={};
 for(const [b,q] of chosen)records[b.key]={stats:{...records[b.key]?.stats,[q.id]:{c:0,w:1,last:'w',at:1}},marks:{},history:[{at:1}],custom:'retain'};
 records[pair[0][0].key].stats[pair[0][1].id].last='r';
 records[pair[0][0].key].stats.removed={c:0,w:1,last:'w'};
 const retry=buildAccountRetry(records);
 assert.equal(retry.company.questions.length,4);assert.equal(new Set(retry.company.questions.map(q=>q.id)).size,4);
 const {default:api}=await server.ssrLoadModule('/src/api.js');
 const writes=[];let fail=false;
 api.defaults.adapter=async config=>{
  const key=config.url.split('/').at(-1);
  if(config.method==='put')writes.push({key,record:JSON.parse(JSON.parse(config.data).data),auth:config.headers.Authorization});
  if(fail&&key===short.key)throw Object.assign(new Error('offline'),{response:{status:503}});
  const source=config.headers.Authorization==='Bearer A'?records:{};
  return {data:config.method==='get'?{data:source[key]?JSON.stringify(source[key]):null}:{},status:200,statusText:'OK',headers:{},config};
 };
 localStorage.setItem('sync:account',JSON.stringify({nickname:'A',token:'A'}));
 const {default:Page}=await server.ssrLoadModule('/src/pages/AccountRetryPage.jsx');
 const mount=async()=>{await act(async()=>{view=TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(Page)));});};
 await mount();
 for(let i=0;i<4;i++){
  const q=retry.company.questions[i];assert.ok(text(view.toJSON()).includes(q.q.replace(/<\/?u>/g,'')), q.id+' expected question: '+text(view.toJSON()).slice(0,900));
  if(q.kind){await act(()=>view.root.findByType(q.kind==='essay'?'textarea':'input').props.onChange({target:{value:q.kind==='short'?q.acc[0]:q.ans}}));await click(button('답안 확인'));if(button('맞았어요'))await click(button('맞았어요'));}
  else{const opts=view.root.findAllByType('button').filter(b=>(b.props.className||'').split(' ').includes('exam-opt'));await click(opts[q.a]);}
  const source=retry.sources[q.id],saved=JSON.parse(localStorage.getItem(`exam-progress:${source.bank}`));
  assert.equal(saved.stats[source.id].last,'r');assert.equal(saved.stats[source.id].c,1);assert.equal(saved.stats[source.id].w,1);assert.equal(saved.custom,'retain');assert.deepEqual(saved.history,[{at:1}]);
  await click(button(i===3?'결과 보기':'다음'));
 }
 assert.ok(text(view.toJSON()).includes('채점 결과'));
 assert.ok(writes.length>=3);assert.ok(writes.every(w=>w.auth==='Bearer A'&&w.key!=='account-retry'));
 await act(()=>{localStorage.setItem('sync:account',JSON.stringify({nickname:'B',token:'B'}));window.dispatchEvent(new Event('sync:change'));});
 assert.ok(text(view.toJSON()).includes('다시 풀 오답이 없습니다.'),'account B excludes cached account A records');
 await act(()=>view.unmount());fail=true;localStorage.setItem('sync:account',JSON.stringify({nickname:'A',token:'A'}));await mount();
 assert.ok(text(view.toJSON()).includes('일부 기록을 불러오지 못했습니다.'));assert.equal(view.root.findAllByType('textarea').length,0);
 assert.deepEqual(errors,[]);
 console.log('Account retry passed: ID collisions, previously corrected mistakes, short/essay grading, per-bank saves, retained history, account isolation, incomplete-load blocking. No live network.');
}finally{if(view)await act(()=>view.unmount());await server.close();console.error=originalError;}
