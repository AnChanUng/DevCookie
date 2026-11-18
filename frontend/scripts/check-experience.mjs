import assert from 'node:assert/strict';
import React from 'react';
import Renderer,{act} from 'react-test-renderer';
import {MemoryRouter,Routes,Route,useLocation,useNavigate} from 'react-router-dom';
import {createServer} from 'vite';
import {readFile} from 'node:fs/promises';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
let view,loc,nav;
const text=n=>typeof n==='string'?n:(n?.children||[]).map(text).join('');
try{
 const {default:Page,filterExperiences}=await server.ssrLoadModule('/src/pages/ExperiencePage.jsx');
 const {EXPERIENCES:all,EXPERIENCE_CATEGORIES:cats}=await server.ssrLoadModule('/src/data/experiences.js');
 assert.equal(new Set(all.map(e=>e.id)).size,all.length);
 for(const e of all){assert.ok(cats.includes(e.category));assert.ok(e.actions.length&&e.sources.length&&e.check.length);assert.equal(e.questions.length,3);}
 assert.ok(filterExperiences('전체','세마포어','전체').some(e=>e.id==='batch'));
 assert.ok(filterExperiences('AI·데이터','Spring AI','StarRoad').length>0);
 assert.equal(filterExperiences('보안','Spring AI','StarRoad').length,0);
 await act(async()=>{view=Renderer.create(React.createElement(MemoryRouter,null,React.createElement(Page)));});
 assert.equal(view.root.findAllByType('article').length,25);
 const click=async label=>{const b=view.root.findAllByType('button').find(b=>text(b)===label);assert.ok(b,label);await act(async()=>b.props.onClick());};
 assert.equal(view.root.findAllByProps({className:'experience-detail'}).length,0);
 await click('모두 펼치기');assert.equal(view.root.findAllByProps({className:'experience-detail'}).length,25);
 await click('모두 접기');assert.equal(view.root.findAllByProps({className:'experience-detail'}).length,0);
 await act(async()=>view.root.findByType('input').props.onChange({target:{value:'세마포어'}}));
 assert.ok(view.root.findAllByType('article').length>0);
 await act(async()=>view.root.findByType('input').props.onChange({target:{value:'no-match-xyz'}}));
 assert.equal(view.root.findAllByType('article').length,0);
 await click('필터 초기화');assert.equal(view.root.findAllByType('article').length,25);
 const category=view.root.findAllByType('button').find(b=>text(b)==='보안1');
 await act(async()=>category.props.onClick());assert.equal(view.root.findAllByType('article').length,1);
 const title=view.root.findByType('h3').findByType('button');
 await act(async()=>title.props.onClick());assert.equal(view.root.findAllByProps({className:'experience-detail'}).length,1);
 await act(async()=>view.unmount());
 const {default:Entry}=await server.ssrLoadModule('/src/components/PracticeEntry.jsx');
 function Probe(){loc=useLocation();nav=useNavigate();return null;}
 await act(async()=>{view=Renderer.create(React.createElement(MemoryRouter,{initialEntries:['/previous','/chanung/experience?x=1#batch'],initialIndex:1},React.createElement(Probe),React.createElement(Routes,null,React.createElement(Route,{path:'/chanung/experience',element:React.createElement(Entry,{suffix:'/experience'})}),React.createElement(Route,{path:'*',element:React.createElement(Page)}))));});
 assert.equal(loc.pathname,'/p/7b92e1c4-a6d8-4f03-9c51-26de8a740bf9/experience');
 assert.equal(loc.search,'?x=1');assert.equal(loc.hash,'#batch');
 await act(async()=>nav(-1));assert.equal(loc.pathname,'/previous');
 const app=await readFile('src/App.jsx','utf8');assert.ok(app.includes('path="chanung/experience"'));assert.ok(app.includes('ExperiencePage'));
 console.log('PASS: 25 experiences, source structure, category/company/search filters, empty reset, expand/collapse, opaque route and back navigation');
}finally{if(view)await act(async()=>view.unmount());await server.close();}
