import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { createServer } from 'vite';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const values = new Map();
globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const oldError = console.error;
const errors = [];
console.error = (...args) => { if (!String(args[0]).startsWith('react-test-renderer is deprecated')) errors.push(args.join(' ')); };
let view;
const text = node => typeof node === 'string' ? node : (Array.isArray(node) ? node : node?.children || []).map(text).join('');
try {
  const { default: Notice } = await server.ssrLoadModule('/src/components/StudyNotice.jsx');
  const { daysLeft, saveExams } = await server.ssrLoadModule('/src/schedule.js');
  assert.equal(daysLeft('2026-10-17', new Date('2026-10-14T15:00:00Z')), 2);
  assert.equal(daysLeft('2026-10-17', new Date('2026-10-16T15:00:00Z')), 0);
  assert.equal(daysLeft('2026-10-17', new Date('2026-10-17T15:00:00Z')), -1);
  assert.equal(daysLeft('2026-02-30'), null);
  assert.equal(daysLeft(''), null);
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  saveExams([{name:'오늘 시험',date:today},{name:'지난 시험',date:'2000-01-01'},{name:'잘못된 날짜',date:'invalid'}]);
  const modal = { open: false, showModal() { this.open = true; }, close() { this.open = false; } };
  await act(()=>{view=TestRenderer.create(React.createElement(Notice),{createNodeMock: el => el.type==='dialog' ? modal : null});});
  assert.equal(modal.open,true,'Notice opens on first render');
  assert.deepEqual(view.root.findAllByType('li').map(text),['기업별 복기 문제집','컴퓨터일반 100제','예상문제집']);
  assert.ok(text(view.toJSON()).includes('오늘 시험'));
  assert.ok(text(view.toJSON()).includes('D-DAY'));
  assert.ok(!text(view.toJSON()).includes('지난 시험'));
  assert.ok(!text(view.toJSON()).includes('잘못된 날짜'));
  await act(()=>view.root.findAllByType('button').find(b=>text(b)==='확인하고 공부 시작').props.onClick());
  assert.equal(modal.open,false);
  saveExams([]);
  await act(()=>view.root.findAllByType('button').find(b=>text(b).startsWith('공지사항')).props.onClick());
  assert.equal(modal.open,true);
  assert.ok(text(view.toJSON()).includes('등록된 예정 시험이 없습니다.'));
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: Notice auto-open/close/reopen, priority order, saved schedule refresh, KST midnight, D-day and invalid/past dates. Native dialog focus and visual layout require browser verification.');
} finally {
  if(view) await act(()=>view.unmount());
  await server.close();
  console.error=oldError;
}
