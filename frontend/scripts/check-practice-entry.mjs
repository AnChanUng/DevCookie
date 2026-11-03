import assert from 'node:assert/strict';
import React from 'react';
import Renderer,{act} from 'react-test-renderer';
import {MemoryRouter,Routes,Route,useLocation,useNavigate} from 'react-router-dom';
import {createServer} from 'vite';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
let view,location,navigate;
function Probe(){location=useLocation();navigate=useNavigate();return null;}
try {
 const {default:Entry}=await server.ssrLoadModule('/src/components/PracticeEntry.jsx');
 await act(async()=>{view=Renderer.create(React.createElement(MemoryRouter,{initialEntries:['/previous','/chanung?version=20261103_ver1#cu-intro'],initialIndex:1},React.createElement(Probe),React.createElement(Routes,null,
 React.createElement(Route,{path:'/chanung',element:React.createElement(Entry)}),
 React.createElement(Route,{path:'*',element:React.createElement('div')}))));});
 assert.equal(location.pathname,'/p/7b92e1c4-a6d8-4f03-9c51-26de8a740bf9');
 assert.equal(location.search,'?version=20261103_ver1');
 assert.equal(location.hash,'#cu-intro');
 await act(async()=>navigate(-1));
 assert.equal(location.pathname,'/previous','old URL is replaced in history');
 console.log('PASS: opaque URL redirect, preserved version and question, replace history');
}finally{if(view)await act(async()=>view.unmount());await server.close();}
