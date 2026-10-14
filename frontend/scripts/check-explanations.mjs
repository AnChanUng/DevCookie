import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { BANKS, allQuestions, companyPath, EXAM_CATEGORIES } from '../src/data/examQuestions.js';
import { TOPICS } from '../src/data/topicBank.js';
import { theoryFor } from '../src/theory.js';
import { explanationFor } from '../src/data/explanationLookup.js';
import notes from '../src/data/questionExplanations.json' with { type: 'json' };

const old = BANKS.filter(b => b.key !== 'pearl').flatMap(allQuestions).filter(theoryFor);
assert.equal(old.length, 638);
for (const q of old) {
  assert.ok(explanationFor(q)?.length > 70, `Missing detailed answer: ${q.id}`);
  assert.equal(explanationFor({...q,id:'copied',topic:q.topic+' · 출처'}), explanationFor(q));
  assert.equal(explanationFor({...q,q:q.q+' changed'}), undefined, 'Changed questions must not inherit an unrelated answer');
}
assert.equal(Object.keys(notes).length,637);
const pearl = BANKS.find(b=>b.key==='pearl');
assert.equal(companyPath(pearl),'/exam/pearl');
assert.ok(EXAM_CATEGORIES.some(c=>c.key===pearl.category && !c.hub));
assert.equal(pearl.questions.length,50);
assert.equal(pearl.questions.filter(q=>!q.kind).length,40);
assert.equal(pearl.questions.filter(q=>q.kind==='essay').length,10);
for(const sec of Object.keys(pearl.sections)) assert.equal(pearl.questions.filter(q=>q.sec===sec).length,10);
for(const q of pearl.questions) {
  if(!q.kind) { assert.equal(q.o.length,5); assert.ok(explanationFor(q)?.length>70); }
  else { assert.ok(q.ans.length>70); assert.ok(q.pts.length>=3); }
}
assert.equal(TOPICS.questions.filter(q=>q.id.startsWith('pearl:')).length,40);
for(const q of TOPICS.questions.filter(theoryFor)) assert.ok(explanationFor(q),q.id);
// SSR verifies the actual JSX and text escaping without browser permission or network access.
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
  const {default:Detail}=await server.ssrLoadModule('/src/components/QuestionExplanation.jsx');
  const {default:React}=await import('react');
  const {renderToStaticMarkup}=await import('react-dom/server');
  for(const q of [...old,...pearl.questions.filter(q=>!q.kind)]) {
    const html=renderToStaticMarkup(React.createElement(Detail,{q}));
    assert.ok(html.includes('문항별 상세 해설'));
    assert.ok(!html.includes('href='));
  }
  const escaped=renderToStaticMarkup(React.createElement(Detail,{q:{explanation:'<script>alert(1)</script>'}}));
  assert.ok(!escaped.includes('<script>'));
} finally { await server.close(); }
console.log('해설 검사 통과 — 기존 638문항, 주제별 복사본, 펄어비스 50문항, 상세 해설 SSR');
