// 정답 보기가 가장 긴 보기인 비율을 문제은행별로 센다
import { readdirSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = 'C:/SSAFY/cs-study-platform/frontend/src/data';
const len = (s) => String(s).replace(/\s+/g, '').length;
const rows = [];
const detail = process.argv[2];

for (const f of readdirSync(dir).filter(f => f.endsWith('Questions.js') && f !== 'cosproQuestions.js')) {
  let mod;
  if (f === 'examQuestions.js') {
    // 다른 파일을 확장자 없이 import하므로 HF_QUESTIONS 배열만 잘라서 읽는다
    const src = readFileSync(path.join(dir, f), 'utf8');
    const a = src.indexOf('export const HF_QUESTIONS = [');
    const b = src.indexOf('\n];', a);
    mod = { HF_QUESTIONS: new Function('return ' + src.slice(a + 'export const HF_QUESTIONS = '.length, b + 2))() };
  } else
  try { mod = await import(pathToFileURL(path.join(dir, f)).href); } catch (e) { rows.push({ file: f, err: e.message.slice(0, 60) }); continue; }
  for (const [name, val] of Object.entries(mod)) {
    let qs = Array.isArray(val) ? val : Array.isArray(val?.questions) ? val.questions : null;
    if (!qs) continue;
    qs = qs.filter(q => Array.isArray(q?.o) && Number.isInteger(q.a) && q.o.length >= 3);
    if (qs.length < 5) continue;
    let longest = 0, shortest = 0, text = 0, ratio = 0, chance = 0;
    const bad = [];
    for (const q of qs) {
      const L = q.o.map(len);
      const a = L[q.a];
      const others = L.filter((_, i) => i !== q.a);
      const isLong = a > Math.max(...others);
      if (isLong) { longest++; bad.push(q); }
      if (a < Math.min(...others)) shortest++;
      ratio += a / (others.reduce((x, y) => x + y, 0) / others.length || 1);
      chance += 1 / q.o.length;
      if (Math.max(...L) >= 12) text++;
    }
    rows.push({ file: f.replace('Questions.js', ''), name, n: qs.length, longest, 'long%': Math.round(longest / qs.length * 100),
      'chance%': Math.round(chance / qs.length * 100), 'short%': Math.round(shortest / qs.length * 100), ratio: +(ratio / qs.length).toFixed(2) });
    if (detail && name === detail) for (const q of bad) console.log(q.id, '|', q.q.slice(0, 50), '|', q.o.map(len).join(','), '| a=' + q.a);
  }
}
if (!detail) console.table(rows);
