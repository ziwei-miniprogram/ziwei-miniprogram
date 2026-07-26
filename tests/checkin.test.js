// 单元测试：文旅打卡数据层（mock 微信本地存储）
function makeStorage() {
  const m = {};
  global.wx = {
    getStorageSync: (k) => (k in m ? m[k] : ''),
    setStorageSync: (k, v) => { m[k] = v; }
  };
  return m;
}

const checkin = require('../utils/checkin.js');

describe('checkin 文旅打卡数据层', () => {
  beforeEach(() => { makeStorage(); });

  test('首次打卡：点亮 + 发 9 折券 + 优先购资格', () => {
    const r = checkin.checkIn('hangzhou');
    expect(r.ok).toBe(true);
    expect(r.checkedCount).toBe(1);
    expect(r.coupon.rate).toBe(0.1);
    expect(r.priorityPass).toBeTruthy();
    expect(checkin.isChecked('hangzhou')).toBe(true);
  });

  test('重复打卡被拒（防重复点亮）', () => {
    checkin.checkIn('hangzhou');
    const r = checkin.checkIn('hangzhou');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('already');
  });

  test('持有折扣券时兑换自动 9 折，最少减 1', () => {
    checkin.checkIn('hangzhou');
    const d = checkin.discountCost(19.9);
    expect(d.discounted).toBe(true);
    expect(d.cost).toBeLessThan(19.9);
    expect(d.cost).toBeGreaterThanOrEqual(1);
  });

  test('集满 6 城解锁全国守护礼', () => {
    checkin.CITIES.forEach(c => checkin.checkIn(c.id));
    expect(checkin.isAllChecked()).toBe(true);
    expect(checkin.allRewardInfo().done).toBe(true);
    expect(checkin.allRewardInfo().remain).toBe(0);
  });

  test('晒单每日上限 3 次，超额被拦截', () => {
    let last;
    for (let i = 0; i < 3; i++) last = checkin.recordShare('商品' + i);
    expect(last.ok).toBe(true);
    const over = checkin.recordShare('超额商品');
    expect(over.ok).toBe(false);
    expect(over.reason).toBe('limit');
  });

  test('haversine 距离与附近城市判定', () => {
    const hit = checkin.nearbyCity(30.2741, 120.1551); // 杭州中心
    expect(hit).not.toBeNull();
    expect(hit.city.id).toBe('hangzhou');
    expect(checkin.nearbyCity(0, 0)).toBeNull();
  });

  test('GPS 自动打卡：命中阈值内城市即点亮', () => {
    const r = checkin.autoCheckInByLocation(30.2741, 120.1551);
    expect(r.status).toBe('checked');
    expect(r.city.id).toBe('hangzhou');
  });

  test('GPS 自动打卡：已点亮城市返回 already', () => {
    checkin.checkIn('hangzhou');
    const r = checkin.autoCheckInByLocation(30.2741, 120.1551);
    expect(r.status).toBe('already');
  });
});
