import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

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
        <p style={{ lineHeight: 1.7, margin: '0 0 16px' }}>
          전산학 전공필기 사이트를 <strong>개발자 취업 준비 사이트</strong>로 리뉴얼할 예정입니다.
        </p>
        <p style={{ display: 'inline-block', margin: '0 0 16px', padding: '8px 16px', borderRadius: 999, border: '1px solid currentColor', fontWeight: 600 }}>
          예상 오픈: 11월 말
        </p>
        <p style={{ lineHeight: 1.7, margin: 0, opacity: 0.75 }}>
          더 나은 모습으로 돌아오겠습니다. 이용에 불편을 드려 죄송합니다.
        </p>
      </section>
    </main>
  );
}
