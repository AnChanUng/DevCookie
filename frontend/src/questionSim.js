import { QUESTION_SIMS } from './data/questionSims';
import { runDisk, runPaging, runSchedule } from './data/calcGenerators';

// 문제 객체가 어느 문제은행 것인지 적어 둔다. 문제 id는 은행 안에서만 겹치지 않으므로 그림 해설을 찾으려면 은행 키가 필요하다
const owner = new WeakMap();
export function tagBank(bankKey, questions) {
  for (const q of questions) owner.set(q, bankKey);
}

// 이 문제에 붙일 그림 해설 재료. 없으면 null.
// 주제별 통합 문제집의 문제는 id가 이미 `은행키:문제id` 꼴이라 그대로 찾는다
export function simFor(q) {
  const key = q.id.includes(':') ? q.id : `${owner.get(q)}:${q.id}`;
  const spec = QUESTION_SIMS[key];
  if (!spec) return null;
  if (spec.type === 'gantt') {
    const { segs } = runSchedule(spec.procs, spec.algo, spec.quantum);
    return { type: 'gantt', names: spec.names || spec.procs.map((_, i) => `P${i + 1}`), segs, procs: spec.procs };
  }
  if (spec.type === 'frames') return { type: 'frames', frames: spec.frames, steps: runPaging(spec.refs, spec.frames, spec.algo).steps };
  return { type: 'disk', path: runDisk(spec.start, spec.queue, spec.algo, spec.max).path, max: spec.max };
}
