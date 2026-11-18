// 대결 채점용 정답표. 대결은 주제별 통합 문제집(TOPICS)에서 문제를 뽑으므로, 서버가 직접 채점할 수 있게
// 문제 번호 · 정답 번호 · 보기 수만 백엔드에 넘긴다(문제 본문은 넘기지 않는다). 문제은행을 고친 뒤 다시 실행한다.
//   node --import ./scripts/extensionless-loader.mjs scripts/export-duel-bank.mjs [--check]
import { readFileSync, writeFileSync } from 'node:fs';
import { TOPICS } from '../src/data/topicBank.js';

const rows = TOPICS.questions.map(q => {
  if (!Array.isArray(q.o) || !Number.isInteger(q.a) || q.a < 0 || q.a >= q.o.length || q.o.length > 9) {
    throw new Error(`채점할 수 없는 문제: ${q.id}`);
  }
  return { id: q.id, a: q.a, n: q.o.length };
});
if (new Set(rows.map(r => r.id)).size !== rows.length) throw new Error('문제 번호가 겹칩니다.');

const path = new URL('../../backend/src/main/resources/duel-bank.json', import.meta.url);
const output = JSON.stringify(rows) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(path, 'utf8') !== output) throw new Error('duel-bank.json을 다시 만들어 주세요.');
  console.log(`duel-bank.json 최신 (${rows.length}문제)`);
} else {
  writeFileSync(path, output);
  console.log(`duel-bank.json에 ${rows.length}문제를 썼습니다.`);
}
