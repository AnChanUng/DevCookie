import { ACCOUNT_BANKS } from './accountRecords';
import { allQuestions } from './data/examQuestions';

// IDs are only unique inside a bank. Keep the original bank/id when combining them.
export function buildAccountRetry(records) {
  const questions = [], sections = {}, sources = {}, stats = {}, marks = {};
  for (const bank of ACCOUNT_BANKS) {
    const record = records[bank.key] || {};
    for (const q of allQuestions(bank)) {
      if (!(Number(record.stats?.[q.id]?.w) > 0)) continue;
      const id = `${bank.key}:${q.id}`;
      if (sources[id]) continue;
      sources[id] = { bank: bank.key, id: q.id };
      questions.push({ ...q, id, sec: bank.key });
      sections[bank.key] = { name: bank.name, short: bank.name, sub: '틀렸던 문제 전체' };
      stats[id] = record.stats[q.id];
      if (record.marks?.[q.id]) marks[id] = record.marks[q.id];
    }
  }
  return {
    company: { key: 'account-retry', name: '전체 오답 다시 풀기', questions, sections },
    sources,
    data: { stats, marks, history: [], updatedAt: 0 },
  };
}

// Only write changed answers/bookmarks back; retain unrelated progress and history.
export function updateRetryRecords(records, sources, previous, next, at) {
  const changed = {};
  for (const [key, source] of Object.entries(sources)) {
    const statChanged = next.stats[key] !== previous.stats[key];
    const markChanged = next.marks[key] !== previous.marks[key];
    if (!statChanged && !markChanged) continue;
    const record = changed[source.bank] || records[source.bank] || {};
    changed[source.bank] = {
      ...record,
      stats: statChanged ? { ...record.stats, [source.id]: next.stats[key] } : record.stats,
      marks: markChanged ? { ...record.marks, [source.id]: next.marks[key] } : record.marks,
      updatedAt: at,
    };
  }
  return changed;
}
