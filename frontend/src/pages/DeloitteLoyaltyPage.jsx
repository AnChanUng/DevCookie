import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LOYALTY_CARDS, REVIEW_CARDS } from '../data/deloitteLoyalty';
import './CompanyPrep.css';
const BASE='/p/7b92e1c4-a6d8-4f03-9c51-26de8a740bf9';
export default function DeloitteLoyaltyPage(){
 const [category,setCategory]=useState('전체'),[open,setOpen]=useState(new Set()),[recall,setRecall]=useState(false);
 const visible=LOYALTY_CARDS.filter(c=>category==='전체'||c.category===category);
 function toggle(id){setOpen(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next;});}
 return <div className="company-prep loyalty-page"><header><p className="prep-eyebrow">DELOITTE ANJIN · COMPANY CORE</p><h1>기업 로열티 집중 준비</h1><p>회사 이름보다, 어떤 일을 하고 왜 관심을 가졌는지 핵심어로 설명해 보세요.</p><nav className="prep-links"><Link to={BASE}>딜로이트 면접 연습</Link><Link to={BASE+'/ai-focus'}>AI 직무 집중 준비</Link><Link to={BASE+'/companies'}>기업 선택</Link></nav></header>
 <section className="loyalty-summary"><h2>먼저 기억할 다섯 가지</h2><p className="prep-core">회계 전문성 · 데이터 처리 · 업무 자동화 · 전문가 판단 지원 · 신뢰</p><p>2016 데이터 분석 기반 → 2025 조직·솔루션 확대 → 2026 옴니아 에이전틱 AI</p></section>
 <div className="prep-toolbar"><p>공식 자료 확인 · 2026.11.03</p><div><button onClick={()=>setRecall(!recall)}>{recall?'핵심어 보이기':'핵심어 가리고 복습'}</button> <button onClick={()=>setOpen(new Set())}>설명 모두 숨기기</button></div></div>
 <div className="loyalty-tabs" role="group" aria-label="기업 학습 영역">{['전체',...new Set(LOYALTY_CARDS.map(c=>c.category))].map(c=><button key={c} aria-pressed={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</div>
 <section aria-label="기업 핵심 카드">{visible.map(c=><article className="prep-question" key={c.id}><span className="prep-topic">{c.category}</span><h2>{c.question}</h2>{!recall&&<p className="prep-core">{c.cores.join(' → ')}</p>}<button className="prep-answer-toggle" aria-expanded={open.has(c.id)} onClick={()=>toggle(c.id)}>{open.has(c.id)?'설명 숨기기':'설명·말하기 예시 보기'}</button>{open.has(c.id)&&<div className="prep-answer">{recall&&<p className="prep-core">{c.cores.join(' → ')}</p>}<p>{c.answer}</p><p className="prep-topic">{c.note}</p><a href={c.source} target="_blank" rel="noreferrer">공식 근거 확인 ↗</a></div>}</article>)}</section>
 <section className="loyalty-review" aria-label="면접 후기 기반 연습"><h2>면접 후기 기반 체크</h2><p>사용자가 제공한 후기: 면접관 3명과 지원자 1명의 개인 면접, 함께 일할 구성원 참여. 특정 후기의 경험이며 이번 전형의 구성·출제 확정 정보는 아닙니다.</p><p>아래는 후기 질문을 준비하기 위한 핵심어와 답변 초안입니다. 개인 경험은 실제 수행한 범위에 맞춰 연습하세요.</p>
 {REVIEW_CARDS.map((r,i)=><article className="prep-question" key={r.question}><span className="prep-topic">후기 기반 · 답변 준비</span><h3>{r.question}</h3>{!recall&&<p className="prep-core">{r.cores}</p>}<button className="prep-answer-toggle" aria-expanded={open.has('review-'+i)} onClick={()=>toggle('review-'+i)}>{open.has('review-'+i)?'답변 숨기기':'답변·준비 방향 보기'}</button>{open.has('review-'+i)&&<div className="prep-answer">{recall&&<p className="prep-core">{r.cores}</p>}<p>{r.answer}</p></div>}</article>)}</section>
 </div>;
}
