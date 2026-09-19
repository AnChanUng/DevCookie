// 문제은행 무결성 검사. 손으로 쓴 문제 데이터에서 잘 나는 실수를 잡는다.
//   npm run check:questions
import { BANKS, allQuestions } from '../src/data/examQuestions.js';

const problems = [];
const note = (bank, id, msg) => problems.push(`${bank}${id ? ` · ${id}` : ''}: ${msg}`);

for (const bank of BANKS) {
  const label = `${bank.key}(${bank.name})`;
  const questions = allQuestions(bank);
  const sections = bank.sections || {};
  const seen = new Set();

  if (!questions.length) note(label, '', '문항이 하나도 없습니다.');

  for (const q of questions) {
    if (!q.id) { note(label, '', 'id가 없는 문항이 있습니다.'); continue; }
    if (seen.has(q.id)) note(label, q.id, 'id가 중복됩니다.');
    seen.add(q.id);

    if (!q.q || !q.q.trim()) note(label, q.id, '질문(q)이 비어 있습니다.');
    if (!q.e || !q.e.trim()) note(label, q.id, '해설(e)이 비어 있습니다.');
    if (!q.sec) note(label, q.id, '영역(sec)이 없습니다.');
    else if (!sections[q.sec]) note(label, q.id, `영역 '${q.sec}'이(가) sections에 없습니다.`);

    if (!Array.isArray(q.o)) { note(label, q.id, '보기(o)가 배열이 아닙니다.'); continue; }
    if (q.o.length < 4 || q.o.length > 5) note(label, q.id, `보기가 ${q.o.length}개입니다. 4개나 5개여야 합니다.`);
    if (q.o.some(o => typeof o !== 'string' || !o.trim())) note(label, q.id, '빈 보기가 있습니다.');
    if (new Set(q.o).size !== q.o.length) note(label, q.id, '같은 내용의 보기가 둘 이상 있습니다.');

    if (!Number.isInteger(q.a)) note(label, q.id, `정답(a)이 정수가 아닙니다: ${q.a}`);
    else if (q.a < 0 || q.a >= q.o.length) note(label, q.id, `정답 번호 ${q.a}가 보기 범위를 벗어났습니다.`);
  }

  // 모의고사에서 영역별로 뽑는 수보다 문제가 적으면 출제가 불가능하다
  for (const [key, count] of Object.entries(bank.draw || {})) {
    const have = bank.questions.filter(q => q.sec === key).length;
    if (have < count) note(label, '', `영역 '${key}'에서 ${count}문제를 뽑아야 하는데 ${have}문제뿐입니다.`);
  }
  for (const [key, section] of Object.entries(sections)) {
    if (section.extra) continue;
    const have = questions.filter(q => q.sec === key).length;
    if (!have) note(label, '', `영역 '${section.name}'에 속한 문제가 없습니다.`);
  }
}

const banks = BANKS.length;
const total = BANKS.reduce((n, b) => n + allQuestions(b).length, 0);

if (problems.length) {
  console.error(`문제은행 검사 실패 — ${problems.length}건`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`문제은행 검사 통과 — ${banks}개 은행, ${total}문항`);
