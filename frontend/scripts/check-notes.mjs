import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import TestRenderer, { act } from 'react-test-renderer';
import { createServer } from 'vite';
import { CS_NOTES } from '../src/data/csNotes.js';

const entries = CS_NOTES.flatMap(section => section.items);
assert.equal(new Set(CS_NOTES.map(s => s.id)).size, CS_NOTES.length);
assert.ok(CS_NOTES.find(s => s.id === 'database')?.items.length >= 15);
for (const section of CS_NOTES) {
  assert.equal(new Set(section.items.map(e => e.title)).size, section.items.length);
  for (const entry of section.items) {
    assert.ok(entry.title && entry.answer.length > 30 && entry.detail.length > 30);
    assert.doesNotMatch(JSON.stringify(entry), /spring|스프링/i);
  }
}
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
let view;
try {
  const { default: Page } = await server.ssrLoadModule('/src/pages/CsNotesPage.jsx');
  const element = path => React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(Page));
  if (!process.argv.includes('--hash')) {
  const html = renderToStaticMarkup(element('/notes'));
  assert.equal((html.match(/<article /g) || []).length, entries.length);
  assert.doesNotMatch(html, /<details|<iframe| hidden[=> ]/);
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'All rendered IDs must be unique');
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), target);
  for (const entry of entries) {
    // React performs HTML escaping; compare the same escaped text representation.
    for (const value of [entry.title, entry.answer, entry.detail]) {
      const escaped = renderToStaticMarkup(React.createElement('p', null, value)).slice(3, -4);
      assert.ok(html.includes(escaped), `Missing visible content: ${entry.title}`);
    }
  }
  // Separate processes keep React's SSR and interaction renderers isolated.
  execFileSync(process.execPath, [process.argv[1], '--hash'], { stdio: 'inherit' });
  console.log(`전공노트 검사 통과 — ${CS_NOTES.length}과목 ${entries.length}주제 전체 렌더링, 목차·직접 해시 이동, Spring 제외`);
  } else {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const scrolled = [];
  globalThis.document = { getElementById: id => ({ scrollIntoView: () => scrolled.push(id) }) };
  for (const id of [...CS_NOTES.map(s => s.id), 'note-sources', 'notes-top', 'unknown']) {
    scrolled.length = 0;
    await act(() => { view = TestRenderer.create(element(`/notes#${id}`)); });
    assert.deepEqual(scrolled, id === 'unknown' ? [] : [id]);
    await act(() => view.unmount());
    view = undefined;
  }
  }
} finally {
  if (view) await act(() => view.unmount());
  await server.close();
  delete globalThis.document;
}
