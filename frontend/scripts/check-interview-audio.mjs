import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { createServer } from 'vite';
import { encodeWav, InterviewRecorder } from '../src/interviewAudio.js';
import { CHANUNG_QUESTIONS } from '../src/data/chanung.js';

const wav = new DataView(await encodeWav(new Float32Array([-2, 0, 2])).arrayBuffer());
assert.equal(wav.getUint32(24, true), 16000); assert.equal(wav.getInt16(44, true), -32768); assert.equal(wav.getInt16(48, true), 32767);
assert.equal(wav.getUint32(40, true), 6);
assert.deepEqual(JSON.parse(readFileSync('../backend/src/main/resources/interview-bank.json', 'utf8')), CHANUNG_QUESTIONS.map(({ id, category, question, answer }) => ({ id, category, question, answer })), 'server grading bank matches UI');
let stopped = 0, completions = 0, pending;
const stream = () => ({ getTracks: () => [{ stop: () => stopped++ }] });
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: async () => stream() } } });
class Recorder {
  static isTypeSupported(type) { return type === 'audio/mp4'; }
  constructor(_stream, options) { this.mimeType = options.mimeType; this.state = 'inactive'; }
  start() { this.state = 'recording'; }
  stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob(['recorded'], { type: this.mimeType }) }); this.onstop(); }
}
globalThis.MediaRecorder = Recorder;
const callbacks = { onReady() {}, onTime() {}, onComplete(blob) { completions++; assert.equal(blob.type, 'audio/mp4'); }, onError: assert.fail };
let capture = new InterviewRecorder(callbacks); await capture.start(); capture.stop(); assert.equal(completions, 1); assert.ok(stopped);
capture = new InterviewRecorder(callbacks); await capture.start(); capture.dispose(); assert.equal(completions, 1, 'unmount discards in-progress capture');
navigator.mediaDevices.getUserMedia = () => new Promise(resolve => { pending = resolve; });
capture = new InterviewRecorder(callbacks); const waiting = capture.start(); capture.dispose(); const before = stopped; pending(stream()); await waiting;
assert.equal(stopped, before + 1, 'late microphone permission releases stream');
navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('denied', 'NotAllowedError'); };
await assert.rejects(new InterviewRecorder(callbacks).start(), /denied/);
navigator.mediaDevices.getUserMedia = async () => stream();

globalThis.window = new EventTarget();
window.AudioContext = class { async decodeAudioData() { return { duration: 2 }; } async close() {} };
window.OfflineAudioContext = class { createBufferSource() { return { connect() {}, start() {} }; } async startRendering() { return { getChannelData: () => new Float32Array(32000) }; } };
let signedIn = true;
globalThis.localStorage = { getItem: key => key === 'sync:account' && signedIn ? JSON.stringify({ id: 1, token: 'test-token' }) : null };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const originalError = console.error, errors = [];
console.error = (...args) => { if (!String(args[0]).startsWith('react-test-renderer is deprecated')) errors.push(args.join(' ')); };
const text = node => typeof node === 'string' ? node : (node?.children || []).map(text).join('');
let view, recording, requestCount = 0;
try {
  const { default: Audio } = await server.ssrLoadModule('/src/components/InterviewAudio.jsx');
  const { default: api } = await server.ssrLoadModule('/src/api.js');
  api.get = async () => ({ data: { available: true } });
  api.post = async (path, data, options) => {
    requestCount++; assert.equal(options.headers.Authorization, 'Bearer test-token');
    if (path.endsWith('/transcribe')) { assert.equal(data.get('audio').type, 'audio/wav'); return { data: { transcript: '인식한 답변' } }; }
    assert.equal(data.questionId, 'cu-rag'); assert.equal(data.transcript, '수정한 답변');
    return { data: { total: 83, relevance: 35, accuracy: 25, structure: 15, clarity: 8, feedback: '근거', strengths: '장점', improvements: '보완', example: '예시' } };
  };
  function Harness() {
    const [value, set] = React.useState(); recording = value;
    return React.createElement(Audio, { questionId: 'cu-rag', recording: value, saveRecording: (_id, next) => set(next) });
  }
  const button = label => view.root.findAllByType('button').find(n => text(n) === label);
  const click = async label => { assert.ok(button(label) && !button(label).props.disabled, label); await act(async () => button(label).props.onClick()); };
  await act(async () => { view = TestRenderer.create(React.createElement(Harness)); });
  await click('녹음 시작'); assert.equal(requestCount, 0, 'recording alone never uploads audio');
  await click('녹음 종료'); assert.ok(recording.blob); assert.equal(view.root.findAllByType('audio').length, 1);
  assert.equal(view.root.findByType('a').props.download, 'cu-rag.m4a');
  await click('녹음 내용 인식'); assert.equal(view.root.findByType('textarea').props.value, '인식한 답변');
  await act(async () => view.root.findByType('textarea').props.onChange({ target: { value: '' } }));
  assert.equal(view.root.findByType('textarea').props.value, '', 'empty transcript remains editable');
  assert.ok(button('확인한 답변으로 채점').props.disabled);
  await act(async () => view.root.findByType('textarea').props.onChange({ target: { value: '수정한 답변' } }));
  await click('확인한 답변으로 채점'); assert.ok(text(view.toJSON()).includes('83 / 100'));
  await act(async () => view.root.findByType('textarea').props.onChange({ target: { value: '추가 수정' } }));
  assert.equal(recording.result, null, 'editing invalidates old grade');
  api.post = async () => { throw { response: { data: { error: 'API 사용 한도 초과' } } }; };
  await click('확인한 답변으로 채점'); assert.ok(view.root.findAllByProps({ role: 'alert' }).some(node => text(node).includes('사용 한도')));
  assert.ok(recording.blob, 'failed AI request preserves recording');
  await click('다시 녹음'); const previous = stopped; await act(async () => view.unmount()); view = null; assert.ok(stopped > previous);
  signedIn = false;
  await act(async () => { view = TestRenderer.create(React.createElement(Harness)); });
  await click('녹음 시작'); await click('녹음 종료'); assert.ok(button('녹음 내용 인식').props.disabled, 'guest can record but AI requires login');
  assert.deepEqual(errors, []);
  console.log('PASS: PCM conversion, microphone lifecycle/late permissions/cancel, replay/download, consent upload, corrected transcript grading, errors, account boundary, canonical bank sync');
} finally { if (view) await act(async () => view.unmount()); console.error = originalError; await server.close(); }
