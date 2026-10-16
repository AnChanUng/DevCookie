const KEY = 'lounge:nickname';
// 오락실 순위판에 쓰던 이름이 있으면 그대로 이어 쓴다
const ARCADE_KEY = 'arcade:nickname';
export const NICKNAME_MAX = 20;

const ADJECTIVES = ['졸린', '배고픈', '열공하는', '합격할', '씩씩한', '차분한', '든든한', '느긋한'];
const ANIMALS = ['수달', '고양이', '판다', '펭귄', '다람쥐', '올빼미', '거북이', '여우'];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const cleanNickname = (value) => value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, NICKNAME_MAX);

export function savedNickname() {
  try {
    return localStorage.getItem(KEY) || cleanNickname(localStorage.getItem(ARCADE_KEY) || '');
  } catch {
    return '';
  }
}

export function saveNickname(name) {
  try { localStorage.setItem(KEY, name); } catch { /* storage unavailable */ }
}

// 채팅과 순위에 쓸 이름. 정한 적이 없으면 하나 지어서 기억해 둔다
export function myNickname() {
  let name = savedNickname();
  if (!name) {
    name = `${pick(ADJECTIVES)} ${pick(ANIMALS)}`.slice(0, NICKNAME_MAX);
    saveNickname(name);
  }
  return name;
}
