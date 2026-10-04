import { tokenize } from '../codeTokens';

// 색을 입힌 조각들을 그린다. 줄 번호를 붙이는 화면은 줄마다 이 컴포넌트를 쓴다
export function CodeTokens({ tokens }) {
  return tokens.map((t, i) => (t.cls ? <span key={i} className={`tk-${t.cls}`}>{t.text}</span> : t.text));
}

// 색을 입힌 코드 블록. 색은 화면 모드마다 index.css의 --code-* 변수가 정한다
export default function Code({ code, className = 'exam-code' }) {
  return <pre className={className}><CodeTokens tokens={tokenize(code)} /></pre>;
}
