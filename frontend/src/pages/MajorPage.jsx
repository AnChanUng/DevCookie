import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { hardcodedCategories } from '../hardcodedData';

// 전공필기/ 폴더의 이론노트 PDF. public/notes/ 에 URL에 안전한 이름으로 복사해 둔다
const NOTES = [
  { file: 'ipe-pilgi-summary.pdf', title: '정보처리기사 필기 요약노트', desc: '필기 전 과목 핵심 정리 · 본편'},
  { file: 'ipe-silgi-theory.pdf', title: '정보처리기사 실기 요약노트 (이론편)', desc: '실기 이론 파트 · 서술형 대비'},
];

export default function MajorPage() {
  // 번들에 들어 있는 카테고리로 바로 그리고, API 응답이 오면 교체한다
  const [categories, setCategories] = useState(hardcodedCategories);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get('/categories')
      .then(res => { if (res.data?.length) setCategories(res.data); })
      .catch(() => {});
  }, []);

  const note = NOTES.find(n => n.file === open);

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>📝 전공필기</h1>
        <p>이론노트 PDF와 과목별 학습 · 데이터베이스 · 자료구조 · 운영체제 · 네트워크 · 도커</p>
      </div>

      <div className="section-title">이론노트</div>
      <div className="notes-grid">
        {NOTES.map(n => (
          <button
            key={n.file}
            type="button"
            className={`note-card ${open === n.file ? 'on' : ''}`}
            onClick={() => { setOpen(open === n.file ? null : n.file); }}
          >
            <span className="note-icon">📄</span>
            <span className="note-body">
              <span className="note-title">{n.title}</span>
              <span className="note-desc">{n.desc}</span>
            </span>
            <span className="note-tag">{open === n.file ? '닫기' : '보기'}</span>
          </button>
        ))}
      </div>

      {note && (
        <div className="note-viewer">
          <div className="note-viewer-bar">
            <strong>{note.title}</strong>
            <span className="spacer" />
            <span className="note-tag">열람 전용</span>
          </div>
          {/* toolbar=0: 브라우저 PDF 뷰어의 다운로드·인쇄 버튼을 숨긴다 */}
          <iframe title={note.title} src={`/notes/${note.file}#toolbar=0&navpanes=0&view=FitH`} className="note-frame" />
          <p className="note-hint">화면에서 바로 읽는 열람 전용 자료입니다. 일부 모바일 브라우저에서는 PDF가 표시되지 않을 수 있습니다.</p>
        </div>
      )}

      <div className="section-title">과목별 학습</div>
      <div className="categories-grid">
        {categories.filter(cat => cat.slug !== 'cicd' && cat.slug !== 'major-exam').map(cat => (
          <Link to={`/category/${cat.slug}`} key={cat.id} className="category-card">
            <div className="category-icon">{cat.iconEmoji}</div>
            <h3>{cat.name}</h3>
            <p>{cat.description}</p>
          </Link>
        ))}
        <Link to="/major-exam" className="category-card major-exam-card">
          <div className="category-icon">🗒️</div>
          <h3>요약노트</h3>
          <p>금융공기업(코스콤, 금융결제원) 대비</p>
        </Link>
      </div>
    </div>
  );
}
