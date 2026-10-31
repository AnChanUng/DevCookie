import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

const values = new Map();
globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
globalThis.window = new EventTarget();
window.location = { href: 'http://localhost/ai-interview', origin: 'http://localhost' };
const scrolled = [];
globalThis.document = { getElementById: id => ({ scrollIntoView: () => scrolled.push(id) }) };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
let view;
const text = node => typeof node === 'string' ? node : (node?.children || []).map(text).join('');
const errors = [];
const originalError = console.error;
console.error = (...args) => { if (!String(args[0]).startsWith('react-test-renderer is deprecated')) errors.push(args.join(' ')); };
try {
  const { AI_QUESTIONS: questions } = await server.ssrLoadModule('/src/data/aiInterview.js');
  assert.equal(questions.length, 30);
  assert.equal(new Set(questions.map(q => q.id)).size, 30);
  for (const q of questions) {
    assert.ok(q.answer.length > 130 && q.answer.includes('**'), q.id);
    assert.equal(q.followUps.length, 1);
    assert.ok(q.followUps.every(f => f.question && f.answer.length > 30));
  }
  const { default: Page } = await server.ssrLoadModule('/src/pages/AiInterviewPage.jsx');
  const mount = async () => { await act(async () => { view = TestRenderer.create(React.createElement(MemoryRouter, { initialEntries: ['/ai-interview#ai-10'] }, React.createElement(Page))); }); };
  const unmount = async () => { await act(() => view.unmount()); view = null; };
  const draft = () => view.root.findByProps({ id: 'draft-ai-01' });
  await mount();
  assert.equal(view.root.findAllByType('article').length, 30);
  assert.ok(questions.every(q => view.root.findByProps({ id: `answer-${q.id}` }).props.hidden), 'answers hidden by default');
  assert.ok(scrolled.includes('ai-10'), 'deep link scrolls to question');
  const card = view.root.findByProps({ id: 'ai-01' });
  await act(() => card.findByType('button').props.onClick());
  assert.equal(view.root.findByProps({ id: 'answer-ai-01' }).props.hidden, false);
  assert.ok(card.findAllByType('strong').some(n => text(n).includes('RAG')), 'markdown keywords render bold');
  assert.ok(card.findByType('details').props.open === undefined, 'follow-up answer starts collapsed');
  await act(() => card.findByType('button').props.onClick());
  assert.equal(view.root.findByProps({ id: 'answer-ai-01' }).props.hidden, true);
  await act(() => draft().props.onChange({ target: { value: '내 RAG 답변' } }));
  await unmount(); await mount();
  assert.equal(draft().props.value, '내 RAG 답변', 'draft survives remount');
  await act(() => { values.set('sync:account', JSON.stringify({ token: 'test-a', id: 101, nickname: 'A' })); window.dispatchEvent(new Event('sync:change')); });
  assert.equal(draft().props.value, '', 'guest draft not exposed to signed-in account');
  await act(() => draft().props.onChange({ target: { value: 'A 답변' } }));
  await act(() => { values.set('sync:account', JSON.stringify({ token: 'test-b', id: 102, nickname: 'B' })); window.dispatchEvent(new Event('sync:change')); });
  assert.equal(draft().props.value, '', 'account drafts are isolated');
  await act(() => { values.set('sync:account', JSON.stringify({ token: 'test-a', id: 101, nickname: 'A' })); window.dispatchEvent(new Event('sync:change')); });
  assert.equal(draft().props.value, 'A 답변');
  await act(() => view.root.findByType('select').props.onChange({ target: { value: '보안 · 업무 신뢰성' } }));
  assert.equal(view.root.findAllByType('article').length, 4);
  await act(() => view.root.findByProps({ type: 'search' }).props.onChange({ target: { value: '없는키워드123' } }));
  assert.equal(view.root.findAllByType('article').length, 0);
  assert.ok(text(view.toJSON()).includes('검색 결과가 없습니다.'));
  await act(() => view.root.findByProps({ type: 'search' }).props.onChange({ target: { value: '' } }));
  await act(() => view.root.findByType('select').props.onChange({ target: { value: '' } }));
  localStorage.setItem = () => { throw new Error('quota'); };
  await act(() => draft().props.onChange({ target: { value: '저장 실패에도 유지' } }));
  assert.equal(draft().props.value, '저장 실패에도 유지');
  assert.ok(text(view.root.findByProps({ role: 'status' })).includes('실패'));
  await unmount();
  values.set('ai-interview:drafts:v1:user:101', '{invalid');
  await mount(); assert.equal(draft().props.value, '', 'invalid saved data handled');
  for (const file of ['src/pages/Home.jsx', 'src/components/Layout.jsx']) {
    const source = readFileSync(file, 'utf8');
    assert.ok(source.includes('/ai-interview'));
    assert.ok(!source.includes('필기이론'), 'old main navigation is hidden');
  }
  assert.ok(readFileSync('src/App.jsx', 'utf8').includes('path="ai-interview"'));
  assert.deepEqual(errors, []);
  console.log('PASS: 30 questions, 30 follow-ups, collapsed answers, bold keywords, deep links, filters, draft persistence/account isolation/storage failures, navigation');
} finally {
  if (view) await act(() => view.unmount());
  console.error = originalError;
  await server.close();
}
