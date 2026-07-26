// 命理娱乐化模型单测（纯函数，无小程序运行时依赖）
const { computeZiwei, computeBazi, computeXz, ZIWEI_MAIN, SUSHE, XZ, HOURS } = require('../utils/divine.js');

describe('computeZiwei', () => {
  test('同一生日结果稳定（确定性）', () => {
    const a = computeZiwei(1995, 8, 15);
    const b = computeZiwei(1995, 8, 15);
    expect(a.star).toBe(b.star);
    expect(a.sushe).toBe(b.sushe);
  });
  test('主星在 14 主星范围内', () => {
    const r = computeZiwei(2000, 1, 1);
    expect(ZIWEI_MAIN).toContain(r.star);
    expect(r.palace).toBe('命宫');
    expect(typeof r.line).toBe('string');
  });
  test('本命宿在二十八宿范围内', () => {
    const r = computeZiwei(1990, 12, 31);
    expect(SUSHE).toContain(r.sushe);
  });
  test('负数年份取模不越界', () => {
    const r = computeZiwei(-5, 3, 7);
    expect(ZIWEI_MAIN).toContain(r.star);
  });
});

describe('computeBazi', () => {
  test('四柱为干支两字', () => {
    const r = computeBazi(1995, 8, 15, 6);
    [r.yg, r.mg, r.dg, r.hg].forEach((p) => expect(p).toMatch(/^.{2}$/));
  });
  test('五行统计覆盖金木水火土', () => {
    const r = computeBazi(1995, 8, 15, 6);
    expect(Array.isArray(r.wx)).toBe(true);
    expect(r.wx.length).toBe(5);
    r.wx.forEach((x) => expect(['金', '木', '水', '火', '土']).toContain(x.k));
    expect(typeof r.line).toBe('string');
  });
  test('时柱随出生时辰变化', () => {
    const r1 = computeBazi(1995, 8, 15, 0);
    const r2 = computeBazi(1995, 8, 15, 6);
    expect(r1.hg).not.toBe(r2.hg);
  });
});

describe('computeXz', () => {
  test('星级在 1-5 且文案存在', () => {
    const r = computeXz(0);
    expect(r.sign).toBe(XZ[0]);
    [r.all, r.love, r.career, r.health].forEach((s) => {
      expect(s).toBeGreaterThanOrEqual(1);
      expect(s).toBeLessThanOrEqual(5);
    });
    expect(typeof r.line).toBe('string');
  });
  test('下标越界兜底为白羊', () => {
    const r = computeXz(0);
    expect(XZ).toContain(r.sign);
  });
  test('时辰表共 12 项', () => {
    expect(HOURS.length).toBe(12);
  });
});
