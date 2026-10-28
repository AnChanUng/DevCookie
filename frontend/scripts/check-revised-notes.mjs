import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { INTERVIEW_NOTES } from '../src/data/interviewNotes.js';
import { NOTE_REVISIONS } from '../src/data/noteRevisions.js';
import { WEB_ESSENTIALS } from '../src/data/webEssentials.js';

const sourceSnapshot = JSON.stringify(INTERVIEW_NOTES);
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { CS_NOTES, migrateNotesCompletion } = await server.ssrLoadModule('/src/data/csNotes.js');
  const { default: Answer } = await server.ssrLoadModule('/src/components/NoteAnswer.jsx');
  assert.equal(CS_NOTES.flatMap(s => s.items).length,169);
  const entries = [...CS_NOTES.flatMap(s => s.items), ...WEB_ESSENTIALS.items];
  const byId = new Map(entries.map(e => [e.id, e]));
  assert.equal(entries.length, 169 + WEB_ESSENTIALS.items.length);
  assert.equal(entries.filter(e => !e.id.startsWith('web-')).length, 169, 'All historical questions remain present');
  assert.equal(byId.size, entries.length);
  for (const id of Object.keys(NOTE_REVISIONS)) assert.ok(byId.has(id), `Orphan revision: ${id}`);
  const originalEntries = INTERVIEW_NOTES.flatMap(s => s.items);
  for (const original of originalEntries) {
    const actual = byId.get(original.id);
    assert.ok(actual, `Missing source identity: ${original.id}`);
    for (const key of ['question', 'title', 'sourceUrl']) assert.equal(actual[key], original[key]);
    if (!NOTE_REVISIONS[original.id]) assert.deepEqual(actual, original);
  }
  assert.equal(JSON.stringify(INTERVIEW_NOTES), sourceSnapshot, 'Never mutate the pinned import');
  const historical = Object.fromEntries(entries.map((e, i) => [e.id, { done: i % 2 === 0, at: i + 1 }]));
  assert.deepEqual(migrateNotesCompletion(historical), historical, 'All existing completion keys remain valid');

  let revised = 0;
  for (const entry of entries) {
    assert.ok(entry.answer.trim(), `Empty answer: ${entry.id}`);
    assert.ok(!/원문에 답변이 작성되어 있지 않습니다|더 학습\s*필요/.test(entry.answer), entry.id);
    const html = renderToStaticMarkup(React.createElement(Answer, { entry }));
    assert.ok(!html.includes('원문에서 보기'), 'Do not restore duplicate source footers');
    if (entry.revised) {
      revised++;
      assert.equal(entry.answer, NOTE_REVISIONS[entry.id]);
      assert.equal(entry.answerMarkdown, entry.answer);
      assert.ok(html.includes('보완 답변'));
      assert.ok(!html.includes('>원문 답변</a>'), 'Revisions must not impersonate the source author');
      assert.ok(!html.includes('<h4></h4>'));
    }
    if (entry.sourceUrl) assert.ok(html.includes(`href="${entry.sourceUrl}"`));
    if (entry.id.startsWith('web-')) {
      assert.equal(entry.answerLabel, '모범답안');
      assert.ok(entry.references.length > 0);
      assert.ok(html.includes('모범답안') && html.includes('참고 자료'));
      assert.ok(!html.includes('>원문 답변</a>'), 'New answers must not impersonate the reference author');
      for (const ref of entry.references) assert.ok(html.includes(`href="${ref.url}"`));
    }
  }
  assert.equal(revised, Object.keys(NOTE_REVISIONS).length);
  const originallyEmpty = originalEntries.filter(e => !e.answerMarkdown);
  assert.equal(originallyEmpty.length, 31);
  for (const entry of originallyEmpty) assert.ok(byId.get(entry.id).revised, `Unfilled source answer: ${entry.id}`);

  const render = id => renderToStaticMarkup(React.createElement(Answer, { entry: byId.get(id) }));
  assert.ok(render('ksundong-3e144e9031b661d3').includes('<table>'), 'Normalization stages render as a table');
  for (const id of ['ksundong-18feb1226da92c24', 'ksundong-d21932e114664fbf']) {
    assert.ok(render(id).includes('<pre><code'), 'Examples render as code, not executable markup');
  }
  console.log(`PASS: ${entries.length} answers render; ${revised} revisions distinguished; all 31 empty source answers filled; IDs, source links and completion records preserved.`);
} finally {
  await server.close();
}
