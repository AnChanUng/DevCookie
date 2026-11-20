import assert from 'node:assert/strict';
import { WEB_ESSENTIALS } from '../src/data/webEssentials.js';
import { WEB_LEVEL, LEVELS } from '../src/data/webEssentialLevels.js';

// 웹 필수지식의 모든 문답에 레벨이 있고, 없는 문답을 가리키는 레벨은 없어야 한다
const ids = new Set(WEB_ESSENTIALS.items.map(e => e.id));
for (const id of ids) assert.ok(WEB_LEVEL[id], `레벨이 없는 문답: ${id} (webEssentialLevels.js에 추가하세요)`);
for (const id of Object.keys(WEB_LEVEL)) assert.ok(ids.has(id), `없는 문답의 레벨: ${id}`);
const valid = new Set(LEVELS.map(l => l.level));
for (const [id, lv] of Object.entries(WEB_LEVEL)) assert.ok(valid.has(lv), `잘못된 레벨 ${lv}: ${id}`);
const counts = LEVELS.map(l => Object.values(WEB_LEVEL).filter(v => v === l.level).length);
for (const [i, n] of counts.entries()) assert.ok(n >= 5, `Lv.${i + 1}에 문답이 너무 적어요(${n}개)`);
console.log(`웹 필수지식 레벨 검사 통과: ${ids.size}문답, ${LEVELS.map((l, i) => `Lv.${l.level} ${counts[i]}개`).join(', ')}`);
