import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { hardcodedCategories } from '../hardcodedData';

export default function MajorPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data?.length ? res.data : hardcodedCategories))
      .catch(() => setCategories(hardcodedCategories))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>📝 전공필기</h1>
        <p>데이터베이스 · 자료구조 · 운영체제 · 네트워크 · 도커 등 과목별 학습</p>
      </div>

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
