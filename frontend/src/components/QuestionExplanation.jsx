import { explanationFor } from '../data/explanationLookup';

export default function QuestionExplanation({ q }) {
  const detail = explanationFor(q);
  if (!detail) return null;
  return <section className="exam-explanation" aria-label="문항별 상세 해설">
    <h4>풀이 과정 · 헷갈리기 쉬운 점</h4>
    {detail.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
  </section>;
}
