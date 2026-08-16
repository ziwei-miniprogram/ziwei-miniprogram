// 农历算法单测（纯函数，无 wx 依赖）：锚点 + 结构不变量 + 边界
const { getLunar, toLunar } = require('../utils/lunar.js');

const SOLAR_TERM = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ZODIAC = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const JIANCHU = ['建','除','满','平','定','执','破','危','成','收','开','闭'];
const DAY_CN = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

describe('lunar.getLunar — 已知锚点', () => {
  test('2026 春节 = 丙午年 正月初一（马年）', () => {
    const L = getLunar(2026, 2, 17);
    expect(L.lunarYear).toBe(2026);
    expect(L.lunarMonth).toBe(1);
    expect(L.lunarDay).toBe(1);
    expect(L.isLeap).toBe(false);
    expect(L.yearGanZhi).toBe('丙午');
    expect(L.animal).toBe('马');
    expect(L.monthCn).toBe('正月');
    expect(L.dayCn).toBe('初一');
    expect(L.fullCn).toBe('丙午年 正月初一');
  });

  test('某日含节气时 term 非空且为合法节气名', () => {
    // 扫描 2026 全年，至少应出现 24 个合法节气
    const found = new Set();
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const t = getLunar(2026, m, d).term;
        if (t) { expect(SOLAR_TERM).toContain(t); found.add(t); }
      }
    }
    expect(found.size).toBe(24);
  });

  test('每月 15 日必无节气', () => {
    for (let m = 1; m <= 12; m++) {
      expect(getLunar(2026, m, 15).term).toBe('');
    }
  });
});

describe('lunar.getLunar — 闰月', () => {
  test('2025 存在闰六月', () => {
    let found = null;
    for (let m = 1; m <= 12 && !found; m++) {
      for (let d = 1; d <= 28; d++) {
        const L = getLunar(2025, m, d);
        if (L.isLeap && L.monthCn === '闰六月') { found = L; break; }
      }
    }
    expect(found).not.toBeNull();
    expect(found.isLeap).toBe(true);
    expect(found.monthCn).toBe('闰六月');
    expect(found.fullCn).toContain('闰六月');
  });
});

describe('lunar.getLunar — 结构不变量', () => {
  test('2026-08-16（今日）字段结构合法', () => {
    const L = getLunar(2026, 8, 16);
    expect(L.yearGanZhi).toHaveLength(2);
    expect(GAN).toContain(L.yearGanZhi[0]);
    expect(ZHI).toContain(L.yearGanZhi[1]);
    expect(ZODIAC).toContain(L.animal);
    expect(DAY_CN).toContain(L.dayCn);
    expect(L.monthCn.endsWith('月')).toBe(true);
    expect(JIANCHU).toContain(L.jianChu);
    expect(typeof L.yi).toBe('string');
    expect(typeof L.ji).toBe('string');
    expect(L.yi.length).toBeGreaterThan(0);
    expect(L.ji.length).toBeGreaterThan(0);
    expect(L.fullCn.startsWith(L.yearGanZhi)).toBe(true);
  });

  test('同一输入确定稳定', () => {
    expect(getLunar(2026, 8, 16)).toEqual(getLunar(2026, 8, 16));
  });

  test('闰月标志为布尔', () => {
    const L = toLunar(2025, 7, 10);
    expect(typeof L.isLeap).toBe('boolean');
    expect(typeof L.year).toBe('number');
    expect(typeof L.month).toBe('number');
    expect(typeof L.day).toBe('number');
  });
});

describe('lunar.getLunar — 边界不抛错', () => {
  test('最早与最晚支持日期', () => {
    expect(() => getLunar(1900, 1, 31)).not.toThrow();
    expect(() => getLunar(2099, 12, 31)).not.toThrow();
  });
});
