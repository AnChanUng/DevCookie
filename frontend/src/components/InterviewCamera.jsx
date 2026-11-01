import { useEffect, useRef, useState } from 'react';

export default function InterviewCamera() {
  const video = useRef(null);
  const stream = useRef(null);
  const generation = useRef(0);
  const [state, setState] = useState('off');
  const [error, setError] = useState('');
  const [mirror, setMirror] = useState(true);
  const stop = () => {
    generation.current++;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setState('off');
  };
  useEffect(() => () => {
    generation.current++;
    stream.current?.getTracks().forEach(track => track.stop());
  }, []);
  const start = async () => {
    const request = ++generation.current;
    setError(''); setState('waiting');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('카메라를 지원하는 HTTPS 브라우저에서 접속해 주세요.');
      const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      if (generation.current !== request) { next.getTracks().forEach(track => track.stop()); return; }
      stream.current = next;
      video.current.srcObject = next;
      setState('on');
      try { await video.current.play(); } catch { /* Native controls allow playback if autoplay is blocked. */ }
    } catch (e) {
      if (generation.current !== request) return;
      setState('off');
      setError(e.name === 'NotAllowedError' ? '카메라 권한이 거부되었습니다. 브라우저 사이트 설정에서 카메라를 허용해 주세요.' : e.name === 'NotFoundError' ? '카메라를 찾지 못했습니다.' : e.name === 'NotReadableError' ? '다른 프로그램에서 카메라를 사용 중인지 확인해 주세요.' : e.message);
    }
  };
  return <section className="interview-camera" aria-label="표정 확인용 카메라">
    <div className="chanung-actions"><button type="button" className="exam-btn sm" aria-pressed={state === 'on'} onClick={state === 'off' ? start : stop}>{state === 'on' ? '카메라 끄기' : state === 'waiting' ? '카메라 요청 취소' : '카메라 켜기'}</button>
      <label><input type="checkbox" checked={mirror} onChange={e => setMirror(e.target.checked)} /> 거울 모드</label>
    </div>
    <video ref={video} hidden={state !== 'on'} autoPlay muted playsInline controls className={mirror ? 'camera-preview is-mirrored' : 'camera-preview'} aria-label="내 표정 실시간 미리보기" />
    <p className="audio-hint">{state === 'waiting' ? '카메라 권한 확인 중… ' : ''}표정과 시선을 실시간으로 확인하세요. 영상은 녹화하거나 전송하지 않습니다. 질문을 바꾸거나 페이지를 나가면 카메라가 꺼집니다.</p>
    {error && <p role="alert" className="audio-error">{error}</p>}
  </section>;
}
