import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

const memory = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.localStorage = memory();
globalThis.sessionStorage = memory();
globalThis.window = Object.assign(new EventTarget(), { location: { pathname: '/bug-hunt', host: 'test.invalid' }, matchMedia: () => ({ matches: false }) });
globalThis.document = { referrer: '' };
const errors = [], originalError = console.error;
console.error = (...args) => { if (!String(args[0]).startsWith('react-test-renderer is deprecated')) errors.push(args.join(' ')); };
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
let view;
const text = node => typeof node === 'string' ? node : (node?.children || []).map(text).join('');
const button = label => view.root.findAllByType('button').find(node => text(node) === label);
const click = async node => { assert.ok(node, 'button exists'); assert.ok(!node.props.disabled, 'button enabled'); await act(() => node.props.onClick()); };
try {
  const { BUG_HUNT, drawBugCases, gradeBugCase } = await server.ssrLoadModule('/src/data/bugHunt.js');
  assert.equal(BUG_HUNT.questions.length, 15);
  assert.equal(new Set(BUG_HUNT.questions.map(q => q.id)).size, 15);
  for (const language of ['c', 'java', 'python']) {
    assert.equal(BUG_HUNT.questions.filter(q => q.sec === language).length, 5);
    const ids = drawBugCases(BUG_HUNT.questions, {}, { language });
    assert.equal(ids.length, 5);
    assert.ok(ids.every(id => BUG_HUNT.questions.find(q => q.id === id).sec === language));
  }
  for (const q of BUG_HUNT.questions) {
    assert.ok(q.bugLine > 0 && q.bugLine <= q.code.split('\n').length);
    assert.equal(q.reasons.length, 4); assert.equal(new Set(q.o).size, 4);
    assert.notEqual(q.code, q.fixedCode); assert.ok(q.e && q.hint);
    assert.equal(gradeBugCase(q, q.bugLine, q.a).points, 20);
    assert.equal(gradeBugCase(q, q.bugLine, (q.a + 1) % 4).correct, false);
  }
  const first = BUG_HUNT.questions[0];
  assert.deepEqual(drawBugCases(BUG_HUNT.questions, { [first.id]: { last: 'w' } }, { wrongOnly: true }), [first.id]);
  assert.equal(drawBugCases(BUG_HUNT.questions, {}, { wrongOnly: true }).length, 0);
  const completed = Object.fromEntries(BUG_HUNT.questions.slice(1).map(q => [q.id, { c: 1, w: 0, last: 'r' }]));
  assert.equal(drawBugCases(BUG_HUNT.questions, completed)[0], first.id, 'unseen questions take priority');
  const { default: api } = await server.ssrLoadModule('/src/api.js');
  const requests = [];
  api.defaults.adapter = async config => {
    requests.push(config);
    return { data: { data: null }, status: 200, statusText: 'OK', headers: {}, config };
  };
  const { default: Page } = await server.ssrLoadModule('/src/pages/BugHuntPage.jsx');
  const mount = async () => { await act(async () => { view = TestRenderer.create(React.createElement(MemoryRouter, null, React.createElement(Page))); }); };
  const unmount = async () => { await act(() => view.unmount()); view = null; };
  await mount();
  assert.ok(button('오답만 재수사 (0)').props.disabled);
  await click(button('수사 시작'));
  for (let i = 0; i < 5; i++) {
    const title = text(view.root.findByType('h2'));
    const q = BUG_HUNT.questions.find(q => q.title === title);
    assert.ok(q);
    assert.ok(button('범인 지목하기').props.disabled);
    assert.equal(view.root.findAllByProps({ 'aria-label': '사건 해설' }).length, 0, 'answer hidden before submission');
    if (!i) {
      await click(button('힌트 보기'));
      assert.ok(text(view.toJSON()).includes(q.hint));
    }
    const line = i === 0 || i === 2 ? (q.bugLine % q.code.split('\n').length) + 1 : q.bugLine;
    const reason = i === 1 || i === 2 ? (q.a + 1) % 4 : q.a;
    await click(view.root.findAllByType('button').find(node => node.props['aria-label']?.startsWith(`${line}행:`)));
    assert.ok(button('범인 지목하기').props.disabled, 'line alone cannot be submitted');
    await click(view.root.findAllByType('button').find(node => text(node).endsWith(q.reasons[reason])));
    const submit = button('범인 지목하기');
    await act(() => { submit.props.onClick(); submit.props.onClick(); });
    const record = JSON.parse(localStorage.getItem('exam-progress:bug-hunt'));
    const expected = gradeBugCase(q, line, reason);
    assert.equal(record.stats[q.id].c + record.stats[q.id].w, 1, 'duplicate clicks record once');
    assert.equal(record.stats[q.id].last, expected.correct ? 'r' : 'w');
    assert.ok(text(view.root.findByProps({ 'aria-label': '사건 해설' })).includes(q.e));
    if (!i) {
      await unmount(); await mount();
      assert.ok(text(view.toJSON()).includes(q.title));
      assert.ok(text(view.toJSON()).includes('놓친 단서를 확인해 보세요.'));
      assert.equal(JSON.parse(localStorage.getItem('exam-progress:bug-hunt')).stats[q.id].w, 1, 'resuming does not grade again');
    }
    const next = button(i === 4 ? '수사 결과 보기' : '다음 사건');
    await act(() => { next.props.onClick(); next.props.onClick(); });
    if (i < 4) assert.ok(text(view.root.findByProps({ 'aria-label': '수사 진행' })).includes(`사건 ${i + 2} / 5`), 'duplicate navigation cannot skip a case');
  }
  assert.ok(text(view.root.findByProps({ 'aria-label': '수사 결과' })).includes('60 / 100점'));
  const { summarizeAccount } = await server.ssrLoadModule('/src/accountRecords.js');
  const { buildAccountRetry } = await server.ssrLoadModule('/src/accountRetry.js');
  const record = JSON.parse(localStorage.getItem('exam-progress:bug-hunt'));
  const summary = summarizeAccount({ 'bug-hunt': record });
  assert.equal(summary.rows.length, 5); assert.equal(summary.wrong, 3);
  assert.ok(summary.rows.every(row => row.path === '/bug-hunt'));
  const retry = buildAccountRetry({ 'bug-hunt': record });
  assert.equal(retry.company.questions.length, 3);
  assert.ok(retry.company.questions.every(q => q.code && q.o.length === 4 && q.e));
  await click(button('다음 수사 준비'));
  await click(button('오답만 재수사 (3)'));
  assert.ok(text(view.root.findByProps({ 'aria-label': '수사 진행' })).includes('사건 1 / 3'));
  await act(() => {
    localStorage.setItem('sync:account', JSON.stringify({ id: 42, nickname: '수사관', token: 'fixture' }));
    window.dispatchEvent(new Event('sync:change'));
  });
  assert.ok(button('수사 시작'), 'account switch does not continue guest session');
  await act(() => view.root.findByType('select').props.onChange({ target: { value: 'python' } }));
  await click(button('수사 시작'));
  const q = BUG_HUNT.questions.find(q => q.title === text(view.root.findByType('h2')));
  assert.equal(q.sec, 'python');
  await click(view.root.findAllByType('button').find(node => node.props['aria-label']?.startsWith(`${q.bugLine}행:`)));
  await click(view.root.findAllByType('button').find(node => text(node).endsWith(q.reasons[q.a])));
  await click(button('범인 지목하기'));
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 1700)); });
  const write = requests.findLast(config => config.method === 'put' && config.url === '/exam/progress/bug-hunt');
  assert.ok(write); assert.equal(write.headers.Authorization, 'Bearer fixture');
  assert.equal(JSON.parse(JSON.parse(write.data).data).stats[q.id].last, 'r');
  await unmount();
  localStorage.removeItem('sync:account');
  localStorage.setItem('bug-hunt:round:v1:guest', JSON.stringify({ ids: ['removed-question'], index: 0 }));
  await mount(); assert.ok(button('수사 시작'), 'invalid saved session returns to lobby');
  await unmount();
  const storage = localStorage;
  globalThis.localStorage = { getItem() { throw new Error('blocked storage'); }, setItem() { throw new Error('blocked storage'); }, removeItem() {} };
  await mount(); await click(button('수사 시작'));
  assert.ok(view.root.findByProps({ 'aria-label': '수사 진행' }), 'play remains available without storage');
  await unmount(); globalThis.localStorage = storage;
  assert.deepEqual(errors, []);
  console.log('Bug hunt passed: 15 cases, language/unseen/wrong filters, two-part grading, duplicate guard, reload resume, 5-case scoring, account records/retry, identity switch, remote sync, corrupt/unavailable storage. No live network.');
} finally {
  if (view) await act(() => view.unmount());
  await server.close(); console.error = originalError;
}
