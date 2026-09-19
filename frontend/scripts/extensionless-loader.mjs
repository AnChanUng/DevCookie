// Vite는 './foo' 같은 확장자 없는 상대 경로를 알아서 찾아 주지만 Node는 그러지 않는다.
// 문제은행 검사 스크립트가 src의 데이터 모듈을 그대로 읽을 수 있도록 '.js'를 붙여 다시 시도한다.
import { register } from 'node:module';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../');
    if (relative && !specifier.endsWith('.js')) {
      return await nextResolve(`${specifier}.js`, context);
    }
    throw err;
  }
}

// `node --import ./scripts/extensionless-loader.mjs` 로 쓰면 위 훅을 등록한다
if (!process.env.EXTENSIONLESS_LOADER_REGISTERED) {
  process.env.EXTENSIONLESS_LOADER_REGISTERED = '1';
  register(import.meta.url, import.meta.url);
}
