// 코드 블록에 가벼운 색을 입힌다. 언어를 가리지 않고 주석 · 문자열 · 숫자 · 예약어만 구분하는 단순한 방식이라
// C · Java · Python · SQL이 섞여 있어도 그대로 쓴다. 색은 화면 모드마다 index.css의 --code-* 변수가 정한다
const KEYWORDS = new Set([
  // Java · C · C++
  'abstract', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double',
  'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import', 'instanceof', 'int', 'interface',
  'long', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'struct', 'super', 'switch',
  'this', 'throw', 'throws', 'try', 'typedef', 'unsigned', 'void', 'volatile', 'while', 'true', 'false', 'var', 'virtual',
  'namespace', 'using', 'template', 'sizeof', 'include', 'define', 'record', 'synchronized', 'override',
  // Python
  'def', 'elif', 'except', 'lambda', 'pass', 'raise', 'with', 'yield', 'None', 'True', 'False', 'and', 'or', 'not', 'in', 'is',
  'from', 'as', 'global', 'nonlocal', 'del', 'assert', 'print', 'self',
  // SQL
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'HAVING', 'ORDER', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'ON', 'AS',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'AND', 'OR', 'NOT',
  'NULL', 'IS', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'DISTINCT', 'UNION', 'ALL', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'PRIMARY',
  'KEY', 'FOREIGN', 'REFERENCES', 'CASCADE', 'COMMIT', 'ROLLBACK', 'BEGIN', 'END', 'CASE', 'WHEN', 'THEN', 'ELSE', 'DESC', 'ASC',
  'LIMIT', 'OVER', 'PARTITION', 'WITH', 'GRANT', 'REVOKE', 'TRUNCATE',
]);

// 주석 | 문자열 | 숫자 | 이름 순으로 먼저 맞는 것을 잡는다. '#'은 C의 전처리문일 수도 있어 줄 주석으로 보지 않는 경우를 따로 거른다
const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#(?!include|define|ifdef|ifndef|endif|pragma)[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?[fFlLuU]?\b)|([A-Za-z_@]\w*)/g;

// 코드를 { cls, text } 조각으로 나눈다. cls가 없는 조각은 색을 입히지 않는다
export function tokenize(code) {
  const text = String(code ?? '');
  const out = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    const cls = m[1] ? 'com' : m[2] ? 'str' : m[3] ? 'num' : m[4].startsWith('@') ? 'ann' : KEYWORDS.has(m[4]) ? 'kw' : null;
    out.push(cls ? { cls, text: m[0] } : { text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

// 줄 번호를 붙여 그리는 화면을 위해, 조각을 줄 단위로 다시 묶는다 (여러 줄 주석도 줄마다 색이 유지된다)
export function tokenLines(code) {
  const lines = [[]];
  for (const t of tokenize(String(code ?? '').replace(/\r/g, ''))) {
    t.text.split('\n').forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ cls: t.cls, text: part });
    });
  }
  return lines;
}
