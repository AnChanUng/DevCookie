export const MAX_RECORD_SECONDS = 180;
export function encodeWav(samples, rate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const text = (at, value) => [...value].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  text(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, 'data'); view.setUint32(40, samples.length * 2, true);
  samples.forEach((value, i) => { const s = Math.max(-1, Math.min(1, value)); view.setInt16(44 + i * 2, Math.round(s < 0 ? s * 32768 : s * 32767), true); });
  return new Blob([buffer], { type: 'audio/wav' });
}

export async function toWav(blob) {
  const Audio = window.AudioContext || window.webkitAudioContext;
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!Audio || !Offline) throw new Error('이 브라우저는 음성 변환을 지원하지 않습니다. Chrome 또는 Safari 최신 버전을 사용해 주세요.');
  const context = new Audio();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    if (decoded.duration < 1) throw new Error('1초 이상 답변을 녹음해 주세요.');
    // Timers can run late in background tabs. Keep the provider payload within 3 minutes.
    const frames = Math.min(Math.ceil(decoded.duration * 16000), MAX_RECORD_SECONDS * 16000);
    const offline = new Offline(1, frames, 16000);
    const source = offline.createBufferSource(); source.buffer = decoded; source.connect(offline.destination); source.start();
    const rendered = await offline.startRendering();
    return encodeWav(rendered.getChannelData(0));
  } finally { await context.close(); }
}

// Owns the microphone lifetime, including permission dialogs that resolve after navigation.
export class InterviewRecorder {
  constructor({ onReady, onTime, onComplete, onError }) {
    Object.assign(this, { onReady, onTime, onComplete, onError });
    this.disposed = false;
  }
  async start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('이 브라우저는 녹음을 지원하지 않습니다. HTTPS 환경의 Chrome 또는 Safari를 사용해 주세요.');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (this.disposed) { stream.getTracks().forEach(t => t.stop()); return; }
    this.stream = stream;
    try {
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'].find(type => MediaRecorder.isTypeSupported(type));
      this.recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = []; let bytes = 0;
      this.recorder.ondataavailable = event => { if (event.data.size) { chunks.push(event.data); bytes += event.data.size; if (bytes > 10 * 1024 * 1024) this.stop(); } };
      this.recorder.onstop = () => {
        this.release();
        if (!this.disposed) this.onComplete(new Blob(chunks, { type: this.recorder.mimeType || chunks[0]?.type || 'audio/webm' }));
      };
      this.recorder.onerror = () => { this.dispose(); this.onError(new Error('녹음 중 오류가 발생했습니다. 마이크를 확인해 주세요.')); };
      this.started = Date.now();
      this.recorder.start(1000); this.onReady();
      this.timer = setInterval(() => { const seconds = Math.floor((Date.now() - this.started) / 1000); this.onTime(seconds); if (seconds >= MAX_RECORD_SECONDS) this.stop(); }, 250);
    } catch (error) { this.release(); throw error; }
  }
  release() { clearInterval(this.timer); this.stream?.getTracks().forEach(t => t.stop()); }
  stop() { if (this.recorder?.state === 'recording') this.recorder.stop(); this.release(); }
  dispose() { this.disposed = true; this.stop(); }
}
