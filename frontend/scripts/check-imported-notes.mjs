import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { INTERVIEW_NOTES } from '../src/data/interviewNotes.js';

const original = fs.readFileSync(new URL('../src/data/vendor/backend-interview-question.md', import.meta.url), 'utf8');
const server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
  const {default: Answer} = await server.ssrLoadModule('/src/components/NoteAnswer.jsx');
  let empty=0, code=0;
  for(const section of INTERVIEW_NOTES) for(const entry of section.items) {
    const line=Number(entry.sourceUrl.match(/#L(\d+)$/)[1]);
    const block=original.split('\n').slice(line-1).join('\n').split('</details>')[0];
    const body=block.slice(block.indexOf('</summary>')+'</summary>'.length).trim();
    // The pinned JSON retains upstream CRLF while Git may check out vendor Markdown as LF.
    if(entry.answerMarkdown) assert.equal(entry.answerMarkdown.replace(/\r\n/g,'\n'),body.replace(/\r\n/g,'\n'),'Exact source answer (line endings normalized): '+entry.id);
    else { empty++; assert.ok(!body.replace(/<[^>]*>/g,'').trim(),'Only empty source answers receive placeholder'); }
    const html=renderToStaticMarkup(React.createElement(Answer,{entry}));
    assert.ok(html.includes(`href="${entry.sourceUrl}"`));
    assert.ok(html.includes('>원문 답변</a></h4>'));
    assert.ok(!html.includes('원문에서 보기'));
    if(entry.answerMarkdown.includes('```')) { assert.ok(html.includes('<pre>') && html.includes('<code'),entry.id); code++; }
  }
  assert.ok(empty>0);assert.ok(code>0);
  const malicious=renderToStaticMarkup(React.createElement(Answer,{entry:{answerMarkdown:'<script>alert(1)</script><img src="x" onerror="alert(2)"><a href="javascript:alert(3)">link</a>'}}));
  assert.ok(!/script|onerror|javascript:/i.test(malicious));
  console.log(`PASS: ${INTERVIEW_NOTES.flatMap(s=>s.items).length} original answers checked; ${empty} empty answers explicitly marked, ${code} code samples rendered; unsafe HTML stripped.`);
} finally { await server.close(); }
