import { useEffect, useState } from 'react';

// 계산 문제 해설을 그림으로 한 단계씩 보여 준다. 재료(sim)는 문제를 만들 때 함께 계산해 둔 것이다.
// type: gantt(스케줄링 간트 차트) · frames(페이지 교체 프레임 표) · disk(디스크 헤드 이동)
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'];

export default function Simulator({ sim }) {
  const total = sim.type === 'gantt' ? sim.segs.length : sim.type === 'frames' ? sim.steps.length : sim.path.length - 1;
  const [step, setStep] = useState(0); // 지금까지 보여 준 단계 수
  const [playing, setPlaying] = useState(false);

  // 재생은 끝 단계에 닿으면 저절로 멈춘 것으로 본다
  const running = playing && step < total;
  useEffect(() => {
    if (!running) return undefined;
    const timer = setTimeout(() => setStep(s => s + 1), 700);
    return () => clearTimeout(timer);
  }, [running, step]);

  return (
    <div className="sim">
      <div className="sim-bar">
        <b>그림으로 보기</b>
        <span>{step} / {total} 단계</span>
        <button type="button" className="exam-btn sm" disabled={step === 0} onClick={() => { setPlaying(false); setStep(step - 1); }}>이전</button>
        <button type="button" className="exam-btn sm" disabled={step >= total} onClick={() => { setPlaying(false); setStep(step + 1); }}>다음</button>
        <button type="button" className="exam-btn sm primary" onClick={() => { if (step >= total) { setStep(0); setPlaying(true); } else setPlaying(!running); }}>{running ? '멈춤' : step >= total ? '처음부터' : '재생'}</button>
        <button type="button" className="exam-btn sm ghost" onClick={() => { setPlaying(false); setStep(total); }}>끝으로</button>
      </div>
      {sim.type === 'gantt' && <Gantt sim={sim} step={step} />}
      {sim.type === 'frames' && <Frames sim={sim} step={step} />}
      {sim.type === 'disk' && <Disk sim={sim} step={step} />}
    </div>
  );
}

// 간트 차트: 실행 조각이 시간 순서대로 하나씩 채워지고, 끝난 프로세스의 대기 시간이 아래에 적힌다
function Gantt({ sim, step }) {
  const end = sim.segs[sim.segs.length - 1].e;
  const shown = sim.segs.slice(0, step);
  const now = shown.length ? shown[shown.length - 1].e : 0;
  return (
    <>
      <div className="sim-gantt">
        {shown.map((s, i) => (
          <div key={i} className="seg" style={{ left: `${s.s / end * 100}%`, width: `${(s.e - s.s) / end * 100}%`, background: COLORS[s.p % COLORS.length] }}>
            {sim.names[s.p]}
          </div>
        ))}
      </div>
      <div className="sim-axis">
        {[0, ...sim.segs.map(s => s.e)].map((t, i) => (
          <span key={i} style={{ left: `${t / end * 100}%`, opacity: t <= now ? 1 : 0.25 }}>{t}</span>
        ))}
      </div>
      <div className="sim-note">
        {sim.procs.map((p, i) => {
          const last = [...shown].reverse().find(s => s.p === i);
          const ran = shown.filter(s => s.p === i).reduce((n, s) => n + s.e - s.s, 0);
          const finished = ran === p.burst;
          return (
            <span key={i} className={finished ? 'done' : ''}>
              <i style={{ background: COLORS[i % COLORS.length] }} />{sim.names[i]} 도착 {p.arrival} · 실행 {ran}/{p.burst}
              {finished && ` · 대기 ${last.e - p.arrival - p.burst}`}
            </span>
          );
        })}
      </div>
    </>
  );
}

// 프레임 표: 참조할 때마다 한 열씩 생기고, 부재가 난 열은 붉게 표시된다
function Frames({ sim, step }) {
  const shown = sim.steps.slice(0, step);
  const faults = shown.filter(s => s.fault).length;
  return (
    <>
      <div className="sim-frames-wrap">
        <table className="sim-frames">
          <tbody>
            <tr>
              <th>참조</th>
              {sim.steps.map((s, i) => <td key={i} className={`ref${i < step ? '' : ' dim'}${i === step - 1 ? ' cur' : ''}`}>{s.page}</td>)}
            </tr>
            {Array.from({ length: sim.frames }, (_, f) => (
              <tr key={f}>
                <th>프레임 {f + 1}</th>
                {sim.steps.map((s, i) => (
                  <td key={i} className={i < step ? (s.fault && s.frames[f] === s.page ? 'in' : '') : 'dim'}>{i < step ? s.frames[f] ?? '' : ''}</td>
                ))}
              </tr>
            ))}
            <tr>
              <th>부재</th>
              {sim.steps.map((s, i) => <td key={i} className={i < step && s.fault ? 'fault' : 'dim'}>{i < step ? (s.fault ? 'F' : '·') : ''}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="sim-note">
        <span>지금까지 부재 <b>{faults}</b>번</span>
        {step > 0 && shown[step - 1].out !== null && <span>방금 {shown[step - 1].out}번 페이지를 내보내고 {shown[step - 1].page}번을 올림</span>}
        {step > 0 && !shown[step - 1].fault && <span>{shown[step - 1].page}번은 이미 올라와 있음 (적중)</span>}
      </div>
    </>
  );
}

// 디스크: 가로는 트랙 번호, 세로는 시간. 헤드가 움직인 자취를 꺾은선으로 그린다
function Disk({ sim, step }) {
  const W = 600;
  const rowH = 26;
  const H = sim.path.length * rowH + 14;
  const x = (track) => 16 + track / sim.max * (W - 32);
  const y = (i) => 14 + i * rowH;
  const shown = sim.path.slice(0, step + 1);
  const moved = shown.slice(1).reduce((n, t, i) => n + Math.abs(t - shown[i]), 0);
  return (
    <>
      <svg className="sim-disk" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="디스크 헤드 이동 경로">
        {sim.path.map((t, i) => <line key={`g${i}`} x1={x(t)} y1={6} x2={x(t)} y2={H} className="guide" />)}
        <polyline points={shown.map((t, i) => `${x(t)},${y(i)}`).join(' ')} className="trail" />
        {sim.path.map((t, i) => (
          <g key={i} opacity={i <= step ? 1 : 0.25}>
            <circle cx={x(t)} cy={y(i)} r={i === step ? 6 : 4} className={i === step ? 'head' : 'dot'} />
            <text x={x(t) + (t > sim.max * 0.9 ? -10 : 10)} y={y(i) + 4} textAnchor={t > sim.max * 0.9 ? 'end' : 'start'}>{t}</text>
          </g>
        ))}
      </svg>
      <div className="sim-note">
        <span>지금까지 이동 거리 <b>{moved}</b></span>
        {step > 0 && <span>{shown[step - 1]} → {shown[step]} : {Math.abs(shown[step] - shown[step - 1])}칸</span>}
      </div>
    </>
  );
}
