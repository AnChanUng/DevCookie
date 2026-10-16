// Snapshot of existing questions for server-side grading. Run again after bank edits.
import { TOPICS } from '../src/data/topicBank.js';
import { writeFileSync, readFileSync } from 'node:fs';
const architecture = /컴퓨터구조|캐시|RAID|기억장치|메모리 계층|파이프|보수|부동소수|진법|논리|명령어|RISC|CISC|AMAT|클럭|CPU 성능|GPU|불 대수|주소 ?지정|DMA|슈퍼스칼라|제어 장치|반가산기|플립플롭|암달|레지스터|시프트|2진|불 함수|조합|MAR|자료 표현|비트 마스크|그레이|체크섬|해밍|카르노|IEEE|CRC|SRAM|버스|플린|인출|평균 기억/;
const classify = q => {
  const topic = q.topic.split(' · ')[0];
  if (q.sec === 'db' || q.sec === 'net') return q.sec;
  if (q.sec === 'os') return architecture.test(topic) ? 'arch' : /프로세스|스레드|교착|메모리|스케줄|페이지|페이징|세마포어|뮤텍스|파일|단편화|시스템 호출|스왑|임계|문맥|기아|가상|스래싱|은행|세그먼|운영체제|OS·|FCFS|SJF|SRT|FIFO|LRU|LFU|OPT|PCB|fork|inode|chmod|umask|UNIX|유닉스|리눅스|모니터|워킹셋|다중 프로그래밍|선점|Busy waiting/.test(topic) ? 'os' : null;
  if (q.sec !== 'pl') return null;
  const language = topic + ' ' + q.q;
  if (/C#|C\+\+/.test(language)) return null;
  if (/Python|파이썬/.test(language)) return 'python';
  if (/Java|자바/.test(language)) return 'java';
  if (/(?:^|[\s·])C(?:[\s·언]|$)/.test(language) || /#include|printf\s*\(/.test(q.code || '')) return 'c';
  return null;
};
const seen = new Set();
const questions = TOPICS.questions.flatMap(q => {
  const group = classify(q), fingerprint = JSON.stringify([q.q,q.code || '',q.o]);
  if (!group || seen.has(fingerprint)) return [];
  seen.add(fingerprint);
  return [{ id:q.id, group, topic:q.topic, q:q.q, code:q.code || null, o:q.o, a:q.a, e:q.e || '' }];
});
for (const [group,n] of Object.entries({os:6,net:6,db:6,arch:6,c:2,java:2,python:2})) {
  const pool=questions.filter(q=>q.group===group);
  if (pool.length<n || pool.some(q=>!Number.isInteger(q.a)||q.a<0||q.a>=q.o.length)) throw new Error('Invalid pool '+group);
  console.log(group, pool.length);
}
const path = new URL('../../backend/src/main/resources/promotion-bank.json', import.meta.url);
const output=JSON.stringify(questions,null,2)+'\n';
if (process.argv.includes('--check')) { if(readFileSync(path,'utf8')!==output) throw new Error('Regenerate promotion-bank.json'); }
else writeFileSync(path,output);
