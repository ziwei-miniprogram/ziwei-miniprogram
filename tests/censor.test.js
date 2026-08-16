// 内容合规预检单测（纯函数，无小程序运行时依赖）
const { check, advice, CATEGORIES } = require('../utils/censor.js');

describe('censor.check', () => {
  test('空 / 非字符串文本直接放行', () => {
    expect(check('').ok).toBe(true);
    expect(check(null).ok).toBe(true);
    expect(check(undefined).ok).toBe(true);
    expect(check(123).ok).toBe(true);
  });

  test('正常文本无命中', () => {
    const r = check('今天天气真好，去公园走走');
    expect(r.ok).toBe(true);
    expect(r.hits).toEqual([]);
  });

  test('命中迷信改运类关键词', () => {
    const r = check('大师改运，逆天改命数');
    expect(r.ok).toBe(false);
    expect(r.hits.some((h) => h.category === '迷信改运承诺')).toBe(true);
    expect(r.hits.some((h) => h.word === '改运')).toBe(true);
  });

  test('命中医疗绝对化承诺类', () => {
    const r = check('这药包治百病，药到病除');
    expect(r.hits.some((h) => h.category === '医疗绝对化承诺')).toBe(true);
  });

  test('命中金钱收益诱导类', () => {
    const r = check('跟我投资稳赚不赔，日入过万');
    expect(r.hits.some((h) => h.category === '金钱收益诱导')).toBe(true);
  });

  test('命中违法违规 / 站外导流类', () => {
    const r = check('加我微信，私聊有惊喜');
    expect(r.hits.some((h) => h.category === '违法违规 / 站外导流')).toBe(true);
  });

  test('同一文本跨多类别命中', () => {
    const r = check('大师改运稳赚不赔加我微信');
    const cats = new Set(r.hits.map((h) => h.category));
    expect(cats.size).toBeGreaterThanOrEqual(3);
  });

  test('命中项携带友好 tip 文案', () => {
    const r = check('改运');
    expect(r.hits[0].tip).toBeTruthy();
  });
});

describe('censor.advice', () => {
  test('无命中返回空串', () => {
    expect(advice([])).toBe('');
    expect(advice(null)).toBe('');
  });

  test('按类别去重，最多 3 条', () => {
    const { hits } = check('改运 包治百病 稳赚不赔 加我微信');
    const lines = advice(hits).split('\n').filter((l) => l.startsWith('·'));
    expect(lines.length).toBeLessThanOrEqual(3);
  });

  test('建议包含命中词与类别提示', () => {
    const { hits } = check('逆天改命数');
    const a = advice(hits);
    expect(a).toContain('迷信改运承诺');
    expect(a).toContain('逆天改命');
  });
});

describe('censor.CATEGORIES', () => {
  test('四大风险类齐全且每类有词与 tip', () => {
    expect(CATEGORIES.length).toBe(4);
    CATEGORIES.forEach((c) => {
      expect(c.key).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.tip).toBeTruthy();
      expect(c.words.length).toBeGreaterThan(0);
    });
  });
});
