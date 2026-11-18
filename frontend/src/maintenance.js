// 리뉴얼 기간 동안 배포된 사이트 전체를 안내 화면(Renewal.jsx)으로 바꾼다. 로컬 개발 서버(npm run dev)에서는 꺼져 있어 전체 화면으로 개발한다.
// 리뉴얼이 끝나면 false로 바꾸면 배포된 사이트도 원래 화면으로 돌아온다.
export const MAINTENANCE = import.meta.env.PROD;
