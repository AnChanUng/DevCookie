import { BANKS, allQuestions, companyPath } from './data/examQuestions';
import { TOPICS } from './data/topicBank';
import { BUG_HUNT } from './data/bugHunt';
import api from './api';

export const ACCOUNT_BANKS = [...BANKS, TOPICS, BUG_HUNT];
export async function loadAccountRecords(user, signal) {
  const records = {};
  const failed = [];
  const keys = [...new Set([...ACCOUNT_BANKS.map(b => b.key), 'cs-notes-v1'])];
  let next = 0;
  let unreachable = false;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < keys.length && !signal?.aborted) {
      const key = keys[next++];
      if (unreachable) { failed.push(key); continue; }
      try {
        if (!user) {
          records[key] = key === 'cs-notes-v1' ? {} : JSON.parse(localStorage.getItem(`exam-progress:${key}`) || '{}');
        } else {
          const response = await api.get(`/exam/progress/${key}`, { headers: { Authorization: `Bearer ${user.token}` }, timeout: 90000, signal });
          records[key] = response.data.data ? JSON.parse(response.data.data) : {};
        }
      } catch (error) {
        failed.push(key);
        if (!error.response || error.response.status === 401) unreachable = true;
      }
    }
  }));
  return { records, failed };
}
export function summarizeAccount(records) {
  const rows = [];
  let attempts = 0, correct = 0;
  for (const bank of ACCOUNT_BANKS) {
    const questions = new Map(allQuestions(bank).map(q => [String(q.id), q]));
    for (const [id, stat] of Object.entries(records[bank.key]?.stats || {})) {
      const c = Math.max(0, Number(stat.c) || 0), w = Math.max(0, Number(stat.w) || 0);
      if (!(c + w)) continue;
      attempts += c + w; correct += c;
      rows.push({ key: `${bank.key}:${id}`, question: questions.get(id), title: questions.get(id)?.q || `문항 ${id}`, bank: bank.name, path: bank.key === 'bug-hunt' ? '/bug-hunt' : bank.key === 'topics' ? '/topics' : bank.key === 'comil' ? '/computer-general' : bank.key === 'ncs' ? '/ncs' : companyPath(bank), c, w, last: stat.last, at: stat.at || 0 });
    }
  }
  rows.sort((a, b) => b.at - a.at || a.key.localeCompare(b.key));
  return { rows, attempts, correct, wrong: rows.filter(r => r.last === 'w').length };
}
