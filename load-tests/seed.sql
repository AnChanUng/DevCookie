-- Synthetic fixtures only. Refuse to run against any other database/server.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
  IF current_database() <> 'cs_study_k6' OR inet_server_addr() <> '127.0.0.1'::inet THEN
    RAISE EXCEPTION 'Load fixtures require the local cs_study_k6 database';
  END IF;
END $$;
DELETE FROM usage_events WHERE visitor_id LIKE 'k6-%';
INSERT INTO visitor_solved (visitor_id, count, updated_at)
SELECT 'k6-fixture-' || n, n, now() FROM generate_series(1, 200) n
ON CONFLICT (visitor_id) DO UPDATE SET count = EXCLUDED.count, updated_at = now();
INSERT INTO visitor_profiles (visitor_id, nickname, updated_at)
SELECT 'k6-fixture-' || n, '부하테스트' || n, now() FROM generate_series(1, 200) n
ON CONFLICT (visitor_id) DO UPDATE SET nickname = EXCLUDED.nickname, updated_at = now();
INSERT INTO usage_events (visitor_id, event_type, path, event_day, created_at, device, score, total, seconds)
SELECT 'k6-fixture-' || (1 + n % 200),
       CASE WHEN n % 4 = 0 THEN 'exam' ELSE 'view' END,
       CASE WHEN n % 4 = 0 THEN '/exam/ibk' ELSE '/notes' END,
       (now() AT TIME ZONE 'Asia/Seoul')::date - (n % 30),
       now() - ((n % 30) || ' days')::interval, 'desktop',
       CASE WHEN n % 4 = 0 THEN 20 END,
       CASE WHEN n % 4 = 0 THEN 30 END,
       CASE WHEN n % 4 = 0 THEN 180 END
FROM generate_series(1, 8000) n;
COMMIT;
