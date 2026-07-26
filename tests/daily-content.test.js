const { getDailyStory, dateKey, dayIndex, SUSHE, HOSTS, SUSHE_LINE, SIGNS, ACTS, MOTIFS }
  = require('../utils/daily-content.js');

test('dayIndex：2026-01-01 为 0，次日为 1', () => {
  expect(dayIndex(new Date(2026, 0, 1))).toBe(0);
  expect(dayIndex(new Date(2026, 0, 2))).toBe(1);
});

test('dayIndex 与 UTC 差值自洽', () => {
  const d = new Date(2026, 6, 26);
  const diff = Math.floor((Date.UTC(2026, 6, 26) - Date.UTC(2026, 0, 1)) / 86400000);
  expect(dayIndex(d)).toBe(diff);
});

test('同一日期确定性：两次调用结果完全一致', () => {
  const d = new Date(2026, 6, 26, 10, 0, 0);
  expect(getDailyStory(d)).toEqual(getDailyStory(new Date(d)));
});

test('字段完整且落在已知池内', () => {
  const s = getDailyStory(new Date(2026, 6, 26));
  expect(SUSHE).toContain(s.sushe);
  expect(HOSTS).toContain(s.host);
  expect(SUSHE_LINE).toContain(s.body);
  expect(SIGNS).toContain(s.sign);
  expect(ACTS).toContain(s.action);
  expect(MOTIFS).toContain(s.motif);
  expect(s.date).toBe(dateKey(new Date(2026, 6, 26)));
});

test('二十八宿全周期循环：第 1 天角宿、第 2 天亢宿', () => {
  expect(getDailyStory(new Date(2026, 0, 1)).sushe).toBe(SUSHE[0]);
  expect(getDailyStory(new Date(2026, 0, 2)).sushe).toBe(SUSHE[1]);
});

test('边界：2026-12-31 仍为合法宿且不越界', () => {
  const s = getDailyStory(new Date(2026, 11, 31));
  expect(SUSHE).toContain(s.sushe);
  expect(s.sushe.length).toBeGreaterThan(0);
});
