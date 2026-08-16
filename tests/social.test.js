// 社交互动状态层单测（mock 内存版 wx + getApp，验证点赞/收藏/关注/日志契约）
const social = require('../utils/social.js');

function mockWx() {
  const store = {};
  global.wx = {
    getStorageSync: (k) => (k in store ? store[k] : ''),
    setStorageSync: (k, v) => { store[k] = v; }
  };
  return store;
}
function mockApp(opts = {}) {
  const app = {
    globalData: opts.globalData ? {} : undefined,
    addMerit: opts.addMerit ? jest.fn() : undefined,
    bumpUnread: opts.bumpUnread ? jest.fn() : undefined
  };
  global.getApp = () => app;
  return app;
}

beforeEach(() => { mockWx(); });
afterEach(() => { delete global.getApp; delete global.wx; });

describe('social.toggleLike', () => {
  test('新点赞 active=true delta=1 并写入状态', () => {
    const r = social.toggleLike(101);
    expect(r).toEqual({ active: true, delta: 1 });
    expect(social.isLiked(101)).toBe(true);
  });
  test('再次点击取消 active=false delta=0', () => {
    social.toggleLike(101);
    const r = social.toggleLike(101);
    expect(r).toEqual({ active: false, delta: 0 });
    expect(social.isLiked(101)).toBe(false);
  });
  test('无 getApp 时仍返回且不抛错', () => {
    delete global.getApp;
    expect(() => {
      expect(social.toggleLike(999)).toEqual({ active: true, delta: 1 });
    }).not.toThrow();
  });
  test('有 app 时联动 addMerit', () => {
    const app = mockApp({ addMerit: true });
    social.toggleLike(202);
    expect(app.addMerit).toHaveBeenCalledWith(1, '点赞');
  });
});

describe('social.toggleCollect / toggleFollow', () => {
  test('收藏双分支', () => {
    expect(social.toggleCollect('n1')).toEqual({ active: true, delta: 1 });
    expect(social.isCollected('n1')).toBe(true);
    expect(social.toggleCollect('n1')).toEqual({ active: false, delta: 0 });
  });
  test('关注双分支', () => {
    expect(social.toggleFollow('阿桥')).toEqual({ active: true, delta: 1 });
    expect(social.isFollowed('阿桥')).toBe(true);
    expect(social.toggleFollow('阿桥')).toEqual({ active: false, delta: 0 });
  });
  test('关注写入动态日志并带 route', () => {
    const before = social.getLog().length;
    social.toggleFollow('晚风');
    const log = social.getLog();
    expect(log.length).toBe(before + 1);
    expect(log[0].text).toContain('晚风');
    expect(log[0].route).toBe('/pages/index/index');
  });
});

describe('social.counts / getLog', () => {
  test('counts 统计三类', () => {
    social.toggleLike('a'); social.toggleCollect('b'); social.toggleFollow('c');
    const c = social.counts();
    expect(c).toEqual({ likes: 1, collects: 1, follows: 1 });
  });
  test('getLog 最多返回 20 条', () => {
    for (let i = 0; i < 25; i++) social.log('e' + i);
    expect(social.getLog()).toHaveLength(20);
    expect(social.getLog()[0].text).toBe('e24');
  });
});

describe('social.log / pushLog 上限', () => {
  test('65 条日志内部封顶 60，对外暴露 20', () => {
    const store = mockWx();
    for (let i = 0; i < 65; i++) social.log('entry' + i);
    expect(social.getLog()).toHaveLength(20);
    const fullLog = Object.values(store).find((v) => Array.isArray(v) && v.length === 60);
    expect(fullLog).toBeDefined();
    expect(social.getLog()[0].text).toBe('entry64');
  });
  test('log 可带 route 溯源', () => {
    social.log('来自发布', '/pages/publish/publish');
    expect(social.getLog()[0].route).toBe('/pages/publish/publish');
  });
  test('app 无 globalData 时 pushLog 不抛错', () => {
    mockApp({}); // 无 globalData / 无 bumpUnread
    expect(() => social.log('x')).not.toThrow();
  });
  test('app 无 bumpUnread 时 pushLog 不抛错', () => {
    mockApp({ globalData: true });
    expect(() => social.log('y')).not.toThrow();
  });
});

describe('social.countStr', () => {
  test('万为单位字符串保持', () => {
    expect(social.countStr('1.2w', 0)).toBe('1.2w');
    expect(social.countStr('3.2w', 0)).toBe('3.2w');
    expect(social.countStr('1.5万', 0)).toBe('1.5w');
  });
  test('数字越 1w 自动换算', () => {
    expect(social.countStr(12345, 0)).toBe('1.2w');
    expect(social.countStr(10000, 0)).toBe('1w');
    expect(social.countStr(9999, 0)).toBe('9999');
    expect(social.countStr('3621', 0)).toBe('3621');
  });
  test('delta 叠加与负值下限', () => {
    expect(social.countStr('5', 1)).toBe('6');
    expect(social.countStr('5', -1)).toBe('4');
    expect(social.countStr('9999', 1)).toBe('1w');
    expect(social.countStr(-5, 0)).toBe('0');
    expect(social.countStr('abc', 0)).toBe('0');
  });
});

describe('social.ensureDefaultFollows', () => {
  test('首次预置 3 个默认关注并 changed=true', () => {
    const changed = social.ensureDefaultFollows();
    expect(changed).toBe(true);
    expect(social.isFollowed('野山星野')).toBe(true);
    expect(social.isFollowed('疗愈所')).toBe(true);
    expect(social.isFollowed('寄愿')).toBe(true);
  });
  test('重复调用 changed=false（幂等）', () => {
    social.ensureDefaultFollows();
    expect(social.ensureDefaultFollows()).toBe(false);
  });
});

describe('social.loadSocial 异常处理', () => {
  test('wx 缺失时回退默认状态', () => {
    delete global.wx;
    expect(social.counts()).toEqual({ likes: 0, collects: 0, follows: 0 });
    expect(social.isLiked('x')).toBe(false);
  });
  test('存储非对象时回退默认', () => {
    const store = mockWx();
    store['social_state'] = 'corrupted';
    expect(social.counts()).toEqual({ likes: 0, collects: 0, follows: 0 });
  });
  test('日志非数组时回退空数组', () => {
    const store = mockWx();
    store['merit_log'] = 'bad';
    expect(social.getLog()).toEqual([]);
  });
});
