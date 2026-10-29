"""Translate k6's exported report display, preserving all measurement events."""
import base64
import gzip
import json
import re
import sys
from pathlib import Path

TITLES = {
    '': '', 'k6 dashboard': 'k6 부하테스트 대시보드', 'Overview': '전체 성능 한눈에 보기',
    'Iteration Rate': '사용자 행동 반복 횟수', 'HTTP Request Rate': '초당 HTTP 요청 수',
    'HTTP Request Duration': 'HTTP 응답시간', 'HTTP Request Failed': 'HTTP 요청 실패율',
    'Received Rate': '초당 수신량', 'Sent Rate': '초당 송신량',
    'HTTP Performance overview': '처리량 · 응답시간 · 오류율', 'VUs': '동시 가상 사용자 수',
    'Transfer Rate': '데이터 전송량', 'Iteration Duration': '사용자 행동 한 번의 소요시간',
    'Timings': '처리 단계별 소요시간', 'HTTP': 'HTTP 요청', 'Request Duration': '요청 응답시간',
    'Request Failed Rate': '요청 실패율', 'Request Rate': '초당 요청 수',
    'Request Waiting': '첫 응답을 받기까지의 대기시간', 'TLS handshaking': 'TLS 보안 연결 시간',
    'Request Sending': '요청 전송 시간', 'Request Connecting': '서버 연결 시간',
    'Request Receiving': '응답 수신 시간', 'Request Blocked': '연결을 기다린 시간',
    'Browser': '브라우저 지표', 'Largest Contentful Paint': '가장 큰 화면 요소 표시 시간(LCP)',
    'First Input Delay': '첫 사용자 입력 지연(FID)', 'Cumulative Layout Shift': '화면 배치 이동(CLS)',
    'Time to First Byte': '첫 응답 수신 시간(TTFB)', 'First Contentful Paint': '첫 화면 요소 표시 시간(FCP)',
    'Interaction to Next Paint': '입력 후 화면 반영 시간(INP)', 'WebSocket': '웹소켓',
    'Connect Duration': '연결 소요시간', 'Session Duration': '세션 유지 시간',
    'Ping Duration': '핑 왕복 시간', 'Sessions Rate': '초당 세션 수', 'gRPC': 'gRPC 통신',
    'Streams Rate': '초당 스트림 수', 'Summary': '전체 측정 결과 요약',
    'Trends': '응답시간 통계', 'Counters': '누적 처리량', 'Rates': '성공률과 실패율', 'Gauges': '사용자 수',
}
DESCRIPTIONS = {
    'Overview': '부하가 증가할 때 처리량과 응답시간, 오류율이 어떻게 변하는지 시간 순서대로 확인합니다.',
    'Timings': 'HTTP 요청을 처리하는 단계별 소요시간입니다. 지연이 증가하는 구간을 비교해 보세요.',
    'Summary': '테스트 전체 구간의 응답시간과 처리량을 요약했습니다. 구간별 그래프의 값과 전체 통계는 다를 수 있습니다.',
    'HTTP': 'HTTP 요청에서 측정한 지표입니다.',
    'HTTP Performance overview': '초당 요청 수, 95%의 요청이 완료된 시간(p95), 요청 실패율을 같은 시간대에 비교합니다.',
    'VUs': '동시에 활동하는 가상 사용자 수와 초당 요청 수입니다. 가상 사용자는 실제 가입자나 DAU·MAU를 의미하지 않습니다.',
    'HTTP Request Duration': '요청을 전송하고 서버 처리와 응답 수신을 마칠 때까지 걸린 시간입니다.',
    'Request Duration': '요청을 전송하고 서버 처리와 응답 수신을 마칠 때까지 걸린 시간입니다.',
    'Request Waiting': '요청 전송 후 첫 응답 바이트를 받을 때까지 걸린 시간입니다.',
    'Request Failed Rate': '테스트에서 정상으로 정한 HTTP 상태 코드에 해당하지 않은 요청의 비율입니다.',
    'HTTP Request Failed': '테스트에서 정상으로 정한 HTTP 상태 코드에 해당하지 않은 요청의 비율입니다.',
    'Iteration Duration': '가상 사용자가 API 8개를 순서대로 호출하고 1초 쉬는 행동 한 번에 걸린 시간입니다.',
    'Transfer Rate': '서버와 주고받은 데이터의 초당 전송량입니다.',
    'Request Blocked': '요청을 시작하기 전에 사용 가능한 연결을 기다린 시간입니다.',
}
LABELS = {
    'time': '시간', 'metric': '지표', 'avg': '평균', 'med': '중앙값', 'min': '최솟값', 'max': '최댓값',
    'count': '누적 건수', 'rate': '비율/초당 값', 'value': '측정값',
    'vus': '가상 사용자 수', 'vus_max': '최대 가상 사용자 수', 'http_reqs': 'HTTP 요청 수',
    'http_req_duration': 'HTTP 응답시간', 'http_req_failed': 'HTTP 요청 실패율',
    'http_req_blocked': '연결 대기시간', 'http_req_connecting': '서버 연결 시간',
    'http_req_tls_handshaking': 'TLS 보안 연결 시간', 'http_req_sending': '요청 전송 시간',
    'http_req_waiting': '첫 응답 대기시간', 'http_req_receiving': '응답 수신 시간',
    'iteration_duration': '사용자 행동 한 번의 소요시간', 'iterations': '완료한 사용자 행동 수',
    'data_received': '수신 데이터', 'data_sent': '송신 데이터',
    'server_errors': '서버 오류와 연결 실패', 'checks': '응답 검증 성공률',
}
FOOTER = '그래프 위에 마우스를 올리면 시점별 수치를 볼 수 있습니다. 원하는 구간을 드래그하면 확대되고, 더블 클릭하면 전체 범위로 돌아갑니다.'


def localize(path):
    html = path.read_text()
    pattern = r'(<script id="data"[^>]*>)(.*?)(</script>)'
    match = re.search(pattern, html, re.S)
    lines = gzip.decompress(base64.b64decode(match.group(2))).decode().splitlines()
    original_measurements = [json.loads(line) for line in lines if json.loads(line)['event'] != 'config']
    config_count = 0

    def translate(node):
        if isinstance(node, dict):
            if 'title' in node:
                title = node['title']
                if title in TITLES:
                    node['title'] = TITLES[title]
                    if 'summary' in node:
                        node['summary'] = DESCRIPTIONS.get(title, TITLES[title] + '의 시간에 따른 변화를 표시합니다.')
                elif title not in TITLES.values():
                    raise ValueError(f'Untranslated title: {title}')
            if 'legend' in node:
                node['legend'] = {'Request Rate': '초당 요청 수', 'Request Duration p(95)': '응답시간 p95', 'Request Failed': '요청 실패율'}.get(node['legend'], node['legend'])
            for value in node.values():
                translate(value)
        elif isinstance(node, list):
            for value in node:
                translate(value)

    for i, line in enumerate(lines):
        obj = json.loads(line)
        if obj['event'] == 'config':
            translate(obj['data'])
            lines[i] = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
            config_count += 1
    assert config_count == 1
    payload = base64.b64encode(gzip.compress(('\n'.join(lines) + '\n').encode(), mtime=0)).decode()
    html = html[:match.start(2)] + payload + html[match.end(2):]
    html = html.replace('<html lang="en">', '<html lang="ko">').replace('<title>k6 report</title>', '<title>k6 부하테스트 보고서</title>')
    html = html.replace('"Report: "', '"부하테스트 보고서: "')
    footer = 'Select a time interval by holding down the mouse on any graph to zoom. To cancel zoom, double click on any graph.'
    html = html.replace(footer, FOOTER)
    # Translate rendered table/legend labels without changing metric IDs or queries.
    labels = json.dumps(LABELS, ensure_ascii=False)
    display_script = '''<script id="k6-korean-display">
(() => {
  const labels = LABELS;
  let scheduled = false;
  const translate = () => {
    scheduled = false;
    const root = document.getElementById('root');
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const value = node.data.trim();
      const key = value.endsWith(':') ? value.slice(0, -1) : value;
      if (Object.hasOwn(labels, key)) {
        node.data = node.data.replace(value, labels[key] + (value.endsWith(':') ? ':' : ''));
      }
    }
  };
  new MutationObserver(() => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(translate); }
  }).observe(document.getElementById('root'), {subtree:true, childList:true, characterData:true});
  translate();
})();
</script>'''.replace('LABELS', labels)
    html = re.sub(r'<script id="k6-korean-display">.*?</script>', '', html, flags=re.S)
    html = html.replace('</body>', display_script + '\n</body>')
    path.write_text(html)
    updated = re.search(pattern, html, re.S)
    restored = gzip.decompress(base64.b64decode(updated.group(2))).decode().splitlines()
    measurements = [json.loads(line) for line in restored if json.loads(line)['event'] != 'config']
    assert measurements == original_measurements, 'Measurement events changed'
    print(f'{path}: Korean display applied; {len(measurements)} measurement events unchanged.')


if __name__ == '__main__':
    localize(Path(sys.argv[1]))
