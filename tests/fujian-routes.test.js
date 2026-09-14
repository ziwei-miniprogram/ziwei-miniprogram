// 单元测试：福建官方线路打卡数据层（静态配置 + 独立存储）
function makeStorage() {
  const m = {};
  global.wx = {
    getStorageSync: (k) => (k in m ? m[k] : ''),
    setStorageSync: (k, v) => { m[k] = v; }
  };
  return m;
}

const R = require('../utils/fujian-routes.js');

// components/icon 自建图标体系可用名（防止写了不存在的图标名导致图标位空白）
const ICON_NAMES = ['lamp', 'wish', 'deeds', 'share', 'merit', 'streak', 'award', 'solar',
  'chart', 'star', 'search', 'msg', 'note', 'journey', 'heart', 'calm', 'blessing', 'tourism'];

describe('fujian-routes 线路数据完整性', () => {
  beforeEach(() => { makeStorage(); });

  test('线路引用的每个站点都存在于 SPOTS', () => {
    const ids = {};
    R.SPOTS.forEach(s => { ids[s.id] = true; });
    R.ROUTES.forEach(route => {
      route.spots.forEach(id => {
        expect(ids[id]).toBe(true);
      });
    });
  });

  test('站点 id 唯一，且每条线路至少 3 站', () => {
    const seen = {};
    R.SPOTS.forEach(s => {
      expect(seen[s.id]).toBeUndefined();
      seen[s.id] = true;
    });
    R.ROUTES.forEach(route => {
      expect(route.spots.length).toBeGreaterThanOrEqual(3);
    });
  });

  test('所有图标名都在自建图标体系内', () => {
    R.ROUTES.forEach(r => { expect(ICON_NAMES).toContain(r.star); });
    R.SPOTS.forEach(s => { expect(ICON_NAMES).toContain(s.star); });
  });

  test('每个站点都有可用坐标（供 GPS 到访判定）', () => {
    R.SPOTS.forEach(s => {
      expect(typeof s.lat).toBe('number');
      expect(typeof s.lng).toBe('number');
      expect(s.lat).toBeGreaterThan(23);
      expect(s.lat).toBeLessThan(29);   // 福建纬度区间
    });
  });

  test('线路条数在 3-5 之间（本次定稿 5 条）', () => {
    expect(R.ROUTES.length).toBeGreaterThanOrEqual(3);
    expect(R.ROUTES.length).toBeLessThanOrEqual(5);
    expect(R.ROUTE_TOTAL).toBe(R.ROUTES.length);
  });
});

describe('fujian-routes 打卡与完成度', () => {
  beforeEach(() => { makeStorage(); });

  test('首次打卡成功并返还星屑', () => {
    const r = R.checkInSpot('tianyou');
    expect(r.ok).toBe(true);
    expect(r.spot.name).toBe('武夷山·天游峰');
    expect(r.shards).toBe(R.SHARDS_PER_SPOT);
    expect(r.spotCount).toBe(1);
    expect(R.isSpotChecked('tianyou')).toBe(true);
  });

  test('重复打卡被拒', () => {
    R.checkInSpot('tianyou');
    const r = R.checkInSpot('tianyou');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('already');
    expect(r.spot).toBeTruthy();
  });

  test('未知站点被拒且不写入存储', () => {
    const r = R.checkInSpot('not-a-spot');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('unknown');
    expect(R.spotsChecked()).toEqual([]);
  });

  test('零进度时完成度为 0（线路层不做虚高起点）', () => {
    const p = R.routeProgress('dawuyi');
    expect(p.done).toBe(0);
    expect(p.pct).toBe(0);
    expect(p.next.name).toBe('武夷山·天游峰');
  });

  test('走完一条线路：标记完成并解锁对应线路星', () => {
    const ids = R.getRoute('taining').spots;
    let last = null;
    ids.forEach(id => { last = R.checkInSpot(id); });
    expect(last.newlyCompleted.length).toBe(1);
    expect(last.newlyCompleted[0].id).toBe('taining');
    expect(last.newlyCompleted[0].shard.name).toBe('丹霞星');

    const p = R.routeProgress('taining');
    expect(p.complete).toBe(true);
    expect(p.pct).toBe(100);
    expect(p.next).toBeNull();

    const o = R.overallProgress();
    expect(o.routesDone).toBe(1);
    expect(o.shardCount).toBe(1);
  });

  test('一点多线：开元寺同时推进滨海线与泉州古城线', () => {
    expect(R.spotRouteIds('kaiyuan').sort()).toEqual(['haishi', 'quanzhou']);
    const before = R.allRouteProgress().filter(p => p.done > 0).length;
    expect(before).toBe(0);
    R.checkInSpot('kaiyuan');
    const touched = R.allRouteProgress().filter(p => p.done > 0);
    expect(touched.length).toBe(2);
    expect(touched.map(p => p.id).sort()).toEqual(['haishi', 'quanzhou']);
  });

  test('未完成线路不产生线路星', () => {
    R.checkInSpot('tianyou');
    expect(R.completedRoutes()).toEqual([]);
    expect(R.overallProgress().shardCount).toBe(0);
  });

  test('遥寄打卡：不在当地也能记录并带 remote 标记', () => {
    const r = R.remoteCheckInSpot('meizhou');
    expect(r.ok).toBe(true);
    expect(r.remote).toBe(true);
    expect(R.isRemoteSpot('meizhou')).toBe(true);
    expect(R.isRemoteSpot('kaiyuan')).toBe(false);
  });

  test('遥寄已打卡点被拒', () => {
    R.checkInSpot('meizhou');
    const r = R.remoteCheckInSpot('meizhou');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('already');
  });
});

describe('fujian-routes 目标梯度推荐', () => {
  beforeEach(() => { makeStorage(); });

  test('全未开始时推荐站点最少的一条（泰宁 4 站，不劝退）', () => {
    const r = R.recommendRoute();
    expect(r.id).toBe('taining');
    expect(r.total).toBe(4);
  });

  test('有进行中时推荐最接近完成的一条', () => {
    // 滨海线 6 站走 4 站 = 67%；泰宁 4 站走 1 站 = 25%
    ['sanfang', 'tannan', 'meizhou', 'kaiyuan'].forEach(id => R.checkInSpot(id));
    R.checkInSpot('dajinhu');
    const r = R.recommendRoute();
    expect(r.id).toBe('haishi');
    expect(r.done).toBe(4);
    expect(r.next).toBeTruthy();
  });

  test('全部完成后 recommendRoute 返回 null', () => {
    R.SPOTS.forEach(s => R.checkInSpot(s.id));
    expect(R.recommendRoute()).toBeNull();
    expect(R.overallProgress().routesDone).toBe(R.ROUTE_TOTAL);
    expect(R.overallProgress().shardCount).toBe(R.ROUTE_TOTAL);
  });
});

describe('fujian-routes GPS 到访判定', () => {
  beforeEach(() => { makeStorage(); });

  test('阈值内命中最近站点', () => {
    const hit = R.nearbySpot(27.7065, 117.6805);   // 天游峰附近
    expect(hit).toBeTruthy();
    expect(hit.spot.id).toBe('tianyou');
    expect(hit.meters).toBeLessThanOrEqual(R.NEAR_RADIUS);
  });

  test('超出阈值返回 null', () => {
    expect(R.nearbySpot(39.9042, 116.4074)).toBeNull();   // 北京
  });

  test('非法坐标返回 null（不抛错）', () => {
    expect(R.nearbySpot('a', 'b')).toBeNull();
    expect(R.nearbySpot(null, undefined)).toBeNull();
  });

  test('自动打卡：命中未点亮则写入，已点亮则报 already', () => {
    const first = R.autoCheckInByLocation(27.7065, 117.6805);
    expect(first.status).toBe('checked');
    expect(first.result.ok).toBe(true);

    const again = R.autoCheckInByLocation(27.7065, 117.6805);
    expect(again.status).toBe('already');

    const far = R.autoCheckInByLocation(39.9042, 116.4074);
    expect(far.status).toBe('none');
  });
});

describe('fujian-routes 其他', () => {
  beforeEach(() => { makeStorage(); });

  test('resetAll 清空线路层存储', () => {
    R.checkInSpot('tianyou');
    expect(R.spotsChecked().length).toBe(1);
    R.resetAll();
    expect(R.spotsChecked()).toEqual([]);
    expect(R.routeProgress('dawuyi').done).toBe(0);
  });

  test('线路层不写城市层存储键（两条线互不干扰）', () => {
    const m = makeStorage();
    R.checkInSpot('tianyou');
    expect(Object.keys(m)).toEqual([R.KEY]);
    expect(m[R.KEY].checked).toEqual(['tianyou']);
  });

  test('getRoute / spotById 对未知 id 返回 null', () => {
    expect(R.getRoute('nope')).toBeNull();
    expect(R.spotById('nope')).toBeNull();
    expect(R.routeProgress('nope')).toBeNull();
  });
});
