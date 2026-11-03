import { Link } from 'react-router-dom';
import './CompanyPrep.css';
const BASE='/p/7b92e1c4-a6d8-4f03-9c51-26de8a740bf9';
export default function CompanyPrepPage(){
 return <div className="company-prep"><header><p className="prep-eyebrow">INTERVIEW PREPARATION</p><h1>기업별 면접 준비</h1><p>지원한 기업을 선택하고, 경험과 직무 지식을 연결해 연습하세요.</p></header>
 <section className="company-cards" aria-label="준비 중인 기업">
 <Link className="company-card" to={BASE}><span className="prep-eyebrow">Deloitte.</span><h2>딜로이트 안진</h2><p>경영지원부문 · IT AI 엔지니어</p><p>자기소개·인성 · 프로젝트 꼬리질문 · AI 직무 집중</p><span className="prep-go">면접 준비 들어가기 →</span></Link></section>
 <Link className="prep-secondary" to={BASE+'/experience'}>내 경험 정리 보기 →</Link>
 </div>;
}
