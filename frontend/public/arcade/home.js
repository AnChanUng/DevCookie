import { store } from '/arcade/common.js';

      const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
      const bests = {
        eliminate: () => {
          try { return JSON.parse(localStorage.getItem('arcade-eliminate') || '{}').best || 0; } catch { return 0; }
        },
        memory: () => {
          const t = store.get('memory:best', {});
          const parts = [[4, '4×4'], [6, '6×6']].filter(([k]) => t[k]).map(([k, n]) => `${n} ${t[k]}회`);
          return parts.length ? parts.join(' · ') : 0;
        },
        reaction: () => {
          const ms = store.get('reaction:best', 0);
          return ms ? `평균 ${ms}ms` : 0;
        },
        mines: () => {
          const t = store.get('mines:best', {});
          const parts = [['easy', '초급'], ['normal', '중급'], ['hard', '고급']].filter(([k]) => t[k]).map(([k, n]) => `${n} ${fmtTime(t[k])}`);
          return parts.length ? parts.join(' · ') : 0;
        },
      };
      // 게임별 1등을 카드에 보여 준다. 서버가 응답하지 않으면 내 기록만 남는다
      const time = (sec) => fmtTime(sec);
      const CHAMPS = {
        eliminate: [['eliminate', '', (n) => `${n.toLocaleString('ko-KR')}점`]],
        2048: [['2048', '', (n) => `${n.toLocaleString('ko-KR')}점`]],
        snake: [['snake', '', (n) => `${n}점`]],
        breakout: [['breakout', '', (n) => `${n.toLocaleString('ko-KR')}점`]],
        flappy: [['flappy', '', (n) => `${n}개`]],
        mines: [['mines-hard', '고급 ', time], ['mines-normal', '중급 ', time], ['mines-easy', '초급 ', time]],
        memory: [['memory-6', '6×6 ', (n) => `${n}회`], ['memory-4', '4×4 ', (n) => `${n}회`]],
        reaction: [['reaction', '', (n) => `${n}ms`]],
      };
      fetch('https://cs-study-backend-i0ln.onrender.com/api/v1/arcade/scores')
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(boards => {
          for (const card of document.querySelectorAll('.game')) {
            const key = card.querySelector('[data-best]').dataset.best;
            // 난이도가 여럿이면 기록이 있는 가장 어려운 판의 1등을 보여 준다
            const hit = (CHAMPS[key] || []).find(([board]) => boards[board]?.length);
            if (!hit) continue;
            const [board, label, format] = hit;
            const line = document.createElement('em');
            line.className = 'champ';
            line.textContent = `🏆 ${label}${boards[board][0].nickname} · ${format(boards[board][0].score)}`;
            card.appendChild(line);
          }
        })
        .catch(() => {});

      for (const el of document.querySelectorAll('[data-best]')) {
        const key = el.dataset.best;
        const best = bests[key] ? bests[key]() : store.get(`${key}:best`, 0);
        if (best) el.textContent = typeof best === 'number' ? `최고 ${best.toLocaleString('ko-KR')}점` : `최고 ${best}`;
      }
