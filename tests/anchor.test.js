// 数字锚点逻辑单测（mock 内存版 wx 存储，验证本地持久化契约）
const anchor = require('../utils/anchor.js');

function mockWx() {
  const store = {};
  global.wx = {
    getStorageSync: (k) => (k in store ? store[k] : ''),
    setStorageSync: (k, v) => { store[k] = v; }
  };
  return store;
}

describe('anchor.genStarName', () => {
  const { genStarName, STAR_POOL, STAR_MODS } = anchor;
  test('组合来自真实星曜池与意象修饰池', () => {
    const name = genStarName(Date.now());
    const [mod, star] = name.split('·');
    expect(STAR_MODS).toContain(mod);
    expect(STAR_POOL).toContain(star);
  });
  test('同一时刻确定性稳定', () => {
    const ts = 1700000000000;
    expect(genStarName(ts)).toBe(genStarName(ts));
  });
  test('跨天主星必变', () => {
    const a = genStarName(1700000000000);
    const b = genStarName(1700000000000 + 86400000);
    expect(a).not.toBe(b);
  });
  test('负时间戳不越界', () => {
    const name = genStarName(-1000);
    const [mod, star] = name.split('·');
    expect(STAR_MODS).toContain(mod);
    expect(STAR_POOL).toContain(star);
  });
});

describe('anchor.ensureBorn / getAnchor / isBorn', () => {
  let store;
  beforeEach(() => { store = mockWx(); });
  test('首次诞生生成定星名与默认愿', () => {
    const a = anchor.ensureBorn();
    expect(a.name).toBeTruthy();
    expect(a.wish).toBe('愿心有所安');
    expect(a.stars).toEqual([]);
    expect(anchor.isBorn()).toBe(true);
  });
  test('读回已保存的星愿', () => {
    store['my_wish'] = '愿世界和平';
    const a = anchor.ensureBorn();
    expect(a.wish).toBe('愿世界和平');
  });
  test('二次调用返回同一锚点（持久化）', () => {
    const a1 = anchor.ensureBorn();
    const a2 = anchor.ensureBorn();
    expect(a2.name).toBe(a1.name);
    expect(a2.bornAt).toBe(a1.bornAt);
  });
  test('getAnchor 返回持久化对象', () => {
    anchor.ensureBorn();
    const g = anchor.getAnchor();
    expect(g).not.toBeNull();
    expect(g.name).toBeTruthy();
  });
});

describe('anchor.addStar / returnedToday', () => {
  beforeEach(() => { mockWx(); anchor.ensureBorn(); });
  test('沉星累加到 stars 头部', () => {
    anchor.addStar('deed', '扶老奶奶');
    expect(anchor.getAnchor().stars[0]).toMatchObject({ type: 'deed', label: '扶老奶奶' });
  });
  test('stars 超过 99 截断', () => {
    for (let i = 0; i < 120; i++) anchor.addStar('deed', 'x');
    expect(anchor.getAnchor().stars.length).toBe(99);
  });
  test('returnedToday 默认 false', () => {
    expect(anchor.returnedToday()).toBe(false);
  });
  test('今日回锚后 returnedToday true', () => {
    anchor.addStar('return', '归锚');
    expect(anchor.returnedToday()).toBe(true);
  });
});

describe('anchor.lampTiers / lightLamp / getDeeds', () => {
  beforeEach(() => { mockWx(); anchor.ensureBorn(); });
  test('lampTiers 返回两档', () => {
    expect(anchor.lampTiers().length).toBe(2);
  });
  test('lightLamp 默认 7 日档，写入 deeds 并沉星', () => {
    const deed = anchor.lightLamp();
    expect(deed.kind).toBe('lamp');
    expect(deed.tier).toBe('7d');
    expect(deed.price).toBe(19.9);
    expect(anchor.getDeeds()[0]).toBe(deed);
    expect(anchor.getAnchor().stars[0].type).toBe('lamp');
  });
  test('lightLamp 支持指定档位与寺庙 / 灯号 / 守护星', () => {
    const deed = anchor.lightLamp('49d', { temple: 'T', lampNo: '№1', birthStar: '北极' });
    expect(deed.tier).toBe('49d');
    expect(deed.price).toBe(99);
    expect(deed.temple).toBe('T');
    expect(deed.birthStar).toBe('北极');
  });
});

describe('anchor.buildTimeline', () => {
  test('过去点亮：七日回响已 done，四十九日未 done', () => {
    const paidAt = Date.now() - 10 * 86400000;
    const tl = anchor.buildTimeline(paidAt);
    expect(tl[0].done).toBe(true);
    expect(tl[1].done).toBe(true);
    expect(tl[2].done).toBe(false);
    expect(tl[3].done).toBe(false);
  });
  test('未来点亮：仅 d0 完成', () => {
    const tl = anchor.buildTimeline(Date.now() + 86400000);
    expect(tl[0].done).toBe(true);
    expect(tl[1].done).toBe(false);
  });
});

describe('anchor.fmtDate', () => {
  test('格式为 月日', () => {
    expect(anchor.fmtDate(new Date(2026, 0, 5).getTime())).toBe('1月5日');
  });
});
