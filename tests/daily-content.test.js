const { getDailyStory, getDailyChapter, getSurprise, getSolarTerm, getNextSolarTerm, dateKey, dayIndex, SUSHE, HOSTS, SUSHE_LINE, SIGNS, ACTS, MOTIFS, SOLAR_TERMS, SEASON_LINES }
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

// ===== 24 节气 × 二十八宿序列化引擎 =====
test('SOLAR_TERMS 含 24 项且 SEASON_LINES 一一对应', () => {
  expect(SOLAR_TERMS.length).toBe(24);
  expect(SEASON_LINES.length).toBe(24);
});

test('getSolarTerm：7/26 落在「大暑」(7/23 起)，且跨年回绕正确', () => {
  expect(getSolarTerm(new Date(2026, 6, 26)).name).toBe('大暑');
  expect(getSolarTerm(new Date(2026, 6, 23)).name).toBe('大暑');
  expect(getSolarTerm(new Date(2026, 6, 22)).name).toBe('小暑');
  // 1 月 1 日归属上一年冬至（12/22）
  expect(getSolarTerm(new Date(2026, 0, 1)).name).toBe('冬至');
  // 1 月 10 日（小寒 1/6 之后）属小寒
  expect(getSolarTerm(new Date(2026, 0, 10)).name).toBe('小寒');
});

test('getNextSolarTerm：7/26 下一节气为「立秋」(8/8)', () => {
  expect(getNextSolarTerm(new Date(2026, 6, 26)).name).toBe('立秋');
});

test('getDailyChapter：字段完整、奖励为 3~9、进度合法', () => {
  const c = getDailyChapter(new Date(2026, 6, 26));
  expect(c.term).toBe('大暑');
  expect(c.termDay).toBeGreaterThanOrEqual(1);
  expect(c.termLen).toBeGreaterThan(0);
  expect(c.nextTerm).toBe('立秋');
  expect(c.nextTermIn).toBeGreaterThanOrEqual(0);
  expect(SUSHE).toContain(c.mansion);
  expect(SEASON_LINES).toContain(c.seasonLine);
  expect(SIGNS).toContain(c.lucky);
  const sp = getSurprise(new Date(2026, 6, 26));
  expect(sp.reward).toBeGreaterThanOrEqual(3);
  expect(sp.reward).toBeLessThanOrEqual(9);
});

test('确定性：同一日期 getDailyChapter / getSurprise 完全一致', () => {
  const d = new Date(2026, 6, 26);
  expect(getDailyChapter(d)).toEqual(getDailyChapter(new Date(d)));
  expect(getSurprise(d)).toEqual(getSurprise(new Date(d)));
});

