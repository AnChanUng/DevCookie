import { Link } from 'react-router-dom';

const BLOGS = [
  { name: '네이버', label: 'NAVER D2', url: 'https://d2.naver.com/' },
  { name: '토스', label: '토스 테크', url: 'https://toss.tech/category/engineering' },
  { name: '무신사', label: '무신사 테크 · 29CM', url: 'https://techblog.musinsa.com/' },
  { name: '카카오', label: '카카오테크', url: 'https://tech.kakao.com/' },
  { name: '우아한형제들', label: '우아한형제들 기술블로그', url: 'https://techblog.woowahan.com/' },
];

export default function TechBlogsPage() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>기업 기술블로그</h1>
        <p>기업별 공식 기술블로그를 새 탭에서 열 수 있어요.</p>
      </div>
      <div className="exam-sections">
        {BLOGS.map(({ name, label, url }) => (
          <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="exam-section"
            aria-label={`${name} 기술블로그 (새 탭에서 열림)`}>
            <span className="t">{name} <span aria-hidden="true">↗</span></span>
            <span className="d">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
