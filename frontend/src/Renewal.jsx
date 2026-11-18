import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// 리뉴얼 기간 동안 배포된 사이트 전체를 안내 화면으로 바꾼다. 로컬 개발 서버(npm run dev)에서는 꺼져 있어 전체 화면으로 개발한다.
// 리뉴얼이 끝나면 false로 바꾸면 배포된 사이트도 원래 화면으로 돌아온다.
export const MAINTENANCE = import.meta.env.PROD;

// 안내 기간에도 열어 두는 화면(/private/chanung)의 바깥 틀. 다른 메뉴로 가는 링크를 두지 않는다
export function RenewalShell() {
  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <Suspense fallback={<div className="loading"><div className="loading-spinner" />불러오는 중...</div>}>
        <Outlet />
      </Suspense>
    </main>
  );
}

export function RenewalNotice() {
  return (
    <main className="container" style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', padding: '48px 16px' }}>
      <section className="fade-in" style={{ maxWidth: 520, textAlign: 'center' }}>
        <div aria-hidden="true" style={{ fontSize: 48, marginBottom: 12 }}>🛠️</div>
        <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', margin: '0 0 12px' }}>사이트 리뉴얼 중입니다</h1>
        <p style={{ lineHeight: 1.7, margin: '0 0 8px' }}>
          더 나은 학습 환경을 위해 전산학 전공필기 사이트를 새로 단장하고 있습니다.
        </p>
        <p style={{ lineHeight: 1.7, margin: 0, opacity: 0.75 }}>
          리뉴얼을 마치는 대로 다시 열겠습니다. 이용에 불편을 드려 죄송합니다.
        </p>
      </section>
    </main>
  );
}
