// 숨은 페이지(public/arcade/eliminate)가 쓰는 문제 데이터를 뽑는다. 그 페이지는 사이트 번들과 따로 도는 정적 페이지라
// src의 문제은행을 직접 import하지 못한다. 문제은행을 고친 뒤에는 이 스크립트를 다시 돌려 주면 된다.
//   node --import ./scripts/extensionless-loader.mjs scripts/build-arcade-data.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BANKS, allQuestions } from '../src/data/examQuestions.js';

// 떨어지는 카드 안에서 읽혀야 하므로 지문·코드가 딸린 문제와 긴 선지는 뺀다
const playable = (q) =>
  !q.code && !q.ctx && q.q.length <= 110 && !q.q.includes('\n') &&
  q.o.every(o => o.length <= 34 && !o.includes('\n'));

const items = [];
for (const bank of BANKS) {
  for (const q of allQuestions(bank)) {
    if (!playable(q)) continue;
    items.push({
      uid: `${bank.key}:${q.id}`,
      key: bank.key,
      id: q.id,
      bank: bank.name,
      area: bank.sections?.[q.sec]?.name || '기타',
      topic: q.topic || '',
      q: q.q, o: q.o, a: q.a, e: q.e,
    });
  }
}

const out = fileURLToPath(new URL('../public/arcade/eliminate/questions.json', import.meta.url));
writeFileSync(out, JSON.stringify(items));
console.log(`${items.length}문제를 ${out}에 썼습니다.`);
