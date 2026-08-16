// 愉悦体验引擎单测（mock page + fake timers，覆盖飘星/晋阶/彩蛋/变体池）
const whimsy = require('../utils/whimsy.js');

let store = {};
beforeAll(() => {
  global.wx = {
    getStorageSync: (k) => (k in store ? store[k] : null),
    setStorageSync: (k, v) => { store[k] = v; }
  };
});
beforeEach(() => { store = {}; jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });

function makePage() {
  return { data: {}, setData(patch) { Object.assign(this.data, patch); } };
}

describe('whimsy.pick', () => {
  test('从数组取值', () => {
    const arr = [1, 2, 3];
    expect(arr).toContain(whimsy.pick(arr));
  });
});

describe('whimsy.burst', () => {
  test('无 page 时安全返回', () => {
    expect(() => whimsy.burst(null)).not.toThrow();
  });
  test('写入 fx 并定时清除', () => {
    const p = makePage();
    whimsy.burst(p, { text: 'hi', emoji: '✦', x: '40%' });
    expect(p.data.fx.length).toBe(1);
    expect(p.data.fx[0].text).toBe('hi');
    jest.advanceTimersByTime(1800);
    expect(p.data.fx.length).toBe(0);
  });
  test('缺省 text / emoji', () => {
    const p = makePage();
    whimsy.burst(p);
    expect(p.data.fx[0].text).toBe('+1 功德');
    expect(p.data.fx[0].emoji).toBe('✦');
  });
});

describe('whimsy.afterMerit', () => {
  test('kind 未命中映射时用 merit 默认', () => {
    const p = makePage();
    whimsy.afterMerit(p, null, null, 1, 'unknown');
    expect(p.data.fx[0].text).toContain('功德');
  });
  test('拼接增益数字（以 + 结尾的文案追加 gain）', () => {
    const p = makePage();
    // pick 取数组首个（CHECKIN[0] 以「+」结尾），使增益拼接分支确定性触发
    jest.spyOn(Math, 'random').mockReturnValue(0);
    whimsy.afterMerit(p, null, null, 5, 'checkin');
    expect(p.data.fx[0].text).toContain('5 功德');
    Math.random.mockRestore();
  });
  test('等级变化触发 levelUp', () => {
    const p = makePage();
    whimsy.afterMerit(p, { name: 'A' }, { name: 'B' }, 1, 'lamp');
    expect(p.data.levelUp).toBeTruthy();
    jest.advanceTimersByTime(2700);
    expect(p.data.levelUp).toBeNull();
  });
  test('等级不变不触发 levelUp', () => {
    const p = makePage();
    whimsy.afterMerit(p, { name: 'A' }, { name: 'A' }, 1, 'lamp');
    expect(p.data.levelUp).toBeUndefined();
  });
});

describe('whimsy.levelUp', () => {
  test('设置并定时清除', () => {
    const p = makePage();
    whimsy.levelUp(p, '清信士');
    expect(p.data.levelUp.name).toBe('清信士');
    jest.advanceTimersByTime(2700);
    expect(p.data.levelUp).toBeNull();
  });
});

describe('whimsy.rainbow', () => {
  test('开启并定时关闭', () => {
    const p = makePage();
    whimsy.rainbow(p);
    expect(p.data.rainbow).toBe(true);
    jest.advanceTimersByTime(6100);
    expect(p.data.rainbow).toBe(false);
  });
});

describe('whimsy.randomBlessing', () => {
  test('返回数组且来自祝福池', () => {
    const b = whimsy.randomBlessing();
    expect(Array.isArray(b)).toBe(true);
    expect(whimsy.COPY.blessings).toContainEqual(b);
  });
});

describe('whimsy.randomStarSign', () => {
  test('无变体池时回退默认', () => {
    const s = whimsy.randomStarSign();
    expect(whimsy.COPY.starsign).toContainEqual(s);
  });
  test('有变体池时优先取变体', () => {
    whimsy.applyVariantPool({ starsign: [{ tip: '测试', line: 'x' }] });
    expect(whimsy.randomStarSign()).toEqual({ tip: '测试', line: 'x' });
  });
});

describe('whimsy.badgeLine', () => {
  test('默认回退', () => {
    expect(whimsy.badgeLine('chuguang', '默认文案')).toBe('默认文案');
  });
  test('变体覆盖', () => {
    whimsy.applyVariantPool({ badgeDesc: { chuguang: '实验文案' } });
    expect(whimsy.badgeLine('chuguang', '默认文案')).toBe('实验文案');
  });
});

describe('whimsy.applyVariantPool', () => {
  test('非法池忽略', () => {
    expect(() => whimsy.applyVariantPool(null)).not.toThrow();
    expect(() => whimsy.applyVariantPool('x')).not.toThrow();
  });
});

describe('whimsy.stardust', () => {
  test('指定参数生成 n 颗并定时清除', () => {
    const p = makePage();
    whimsy.stardust(p, { n: 7, x: '50%', y: '40%' });
    expect(p.data.dust.length).toBe(7);
    jest.advanceTimersByTime(1100);
    expect(p.data.dust.length).toBe(0);
  });
  test('缺省参数使用默认 n 与坐标', () => {
    const p = makePage();
    whimsy.stardust(p);
    expect(p.data.dust.length).toBe(7);
  });
  test('无 page 安全返回', () => {
    expect(() => whimsy.stardust(null)).not.toThrow();
  });
});

describe('whimsy.heroBurst', () => {
  test('生成 16 粒子并定时清除', () => {
    const p = makePage();
    whimsy.heroBurst(p);
    expect(p.data.heroBurst.length).toBe(16);
    jest.advanceTimersByTime(1700);
    expect(p.data.heroBurst).toBeNull();
  });
  test('无 page 安全返回', () => {
    expect(() => whimsy.heroBurst(null)).not.toThrow();
  });
});
