// 单元测试：「一城一人」城市代言人机制
// 三条守门规则（一城一位 / 一人一城 / 在世须授权）+ 合规边界（代言人不带货）
function makeStorage() {
  const m = {};
  global.wx = {
    getStorageSync: (k) => (k in m ? m[k] : ''),
    setStorageSync: (k, v) => { m[k] = v; }
  };
  return m;
}

const E = require('../utils/city-envoy.js');
const fujian = require('../utils/fujian-routes.js');

function writeState(s) { global.wx.setStorageSync(E.KEY, s); }

// 在世人物夹具：不写进生产数据，只在测试里验证「授权门槛」是否真的拦得住
function liveFixture(over) {
  const base = {
    id: 'fixture-host', city: '泉州', name: '某推荐官', kind: 'host',
    era: '在职', title: '城市推荐官',
    line: '一句', deed: '一善', lore: '一知见',
    source: '授权合同编号 X', authorization: 'pending', verify: 'ok', crossCity: false
  };
  return Object.assign(base, over || {});
}

describe('city-envoy 席位结构', () => {
  beforeEach(() => { makeStorage(); });

  test('城市清单与线路层完全一致（能在同城打卡，才能在同城代言）', () => {
    const spotCities = {};
    fujian.SPOTS.forEach(s => { spotCities[s.city] = true; });
    expect(E.CITIES.slice().sort()).toEqual(Object.keys(spotCities).sort());
  });

  test('每位代言人的城市都在城市清单内，id 无重复', () => {
    const seen = {};
    E.ENVOYS.forEach(e => {
      expect(E.CITIES).toContain(e.city);
      expect(seen[e.id]).toBeUndefined();
      seen[e.id] = true;
    });
  });

  test('席位唯一：没有任何一城同时坐着两位', () => {
    expect(E.uniqueViolations()).toEqual([]);
  });

  test('一城一位：点名册每城最多一位在任', () => {
    const list = E.rollCall();
    expect(list.length).toBe(E.CITIES.length);
    list.forEach(r => {
      expect(r.vacant).toBe(!!(r.vacant));
      if (!r.vacant) expect(typeof r.envoy.name).toBe('string');
    });
  });

  test('空缺是合法状态：平潭本轮暂无人选，envoyOf 返回 null 而非报错', () => {
    expect(E.envoyOf('平潭')).toBeNull();
    expect(E.vacantCities()).toContain('平潭');
    expect(E.rollCall().filter(r => r.city === '平潭')[0].vacant).toBe(true);
  });
});

describe('city-envoy 席位守门规则', () => {
  beforeEach(() => { makeStorage(); });

  test('规则③ 在世人物未获授权 → 不得进入在任席位', () => {
    const r = E.canServe(liveFixture({ authorization: 'pending' }), '泉州');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('unauthorized');
  });

  test('在世人物已获授权 → 可以通过守门', () => {
    const r = E.canServe(liveFixture({ authorization: 'granted' }), '泉州');
    expect(r.ok).toBe(true);
  });

  test('历史人物必须是 public-domain，且给出可考 source', () => {
    const sage = E.ENVOYS.filter(e => e.kind === 'sage')[0];
    expect(E.canServe(sage, sage.city).ok).toBe(true);
    expect(E.canServe(Object.assign({}, sage, { authorization: 'granted' }), sage.city).reason)
      .toBe('bad-authorization');
    expect(E.canServe(Object.assign({}, sage, { source: '' }), sage.city).reason)
      .toBe('no-source');
  });

  test('三槽不齐（缺 deed / lore）不允许上岗', () => {
    const sage = E.ENVOYS.filter(e => e.kind === 'sage')[0];
    expect(E.canServe(Object.assign({}, sage, { deed: '' }), sage.city).reason).toBe('incomplete');
    expect(E.canServe(Object.assign({}, sage, { lore: '' }), sage.city).reason).toBe('incomplete');
  });

  test('规则② 一人一城：同一人不得同时代言两城', () => {
    const traveling = liveFixture({ id: 'fixture-traveler', city: '厦门', authorization: 'granted' });
    // 先让它顶掉厦门的默认在任
    const sw = E.servingMap();
    const xmDefault = sw['厦门'];
    expect(xmDefault).toBeTruthy();
    // 直接构造：把同一 id 写进两城，唯一性检查应能被 canServe 拦住
    const r = E.canServe(traveling, '泉州');
    expect(r.ok).toBe(true);                       // 尚未在任，允许
    writeState({ serving: { '厦门': 'fixture-traveler' }, retired: [] });
    expect(E.canServe(traveling, '泉州').reason).toBe('already-serving-elsewhere');
  });

  test('crossCity 例外：显式声明跨城文化人物可以出现在多城', () => {
    const cross = liveFixture({ id: 'fixture-cross', city: '莆田', authorization: 'granted', crossCity: true });
    writeState({ serving: { '厦门': 'fixture-cross' }, retired: [] });
    expect(E.canServe(cross, '莆田').ok).toBe(true);
  });

  test('未知城市 / 未知种类被拒', () => {
    const sage = E.ENVOYS.filter(e => e.kind === 'sage')[0];
    expect(E.canServe(sage, '火星').reason).toBe('unknown-city');
    expect(E.canServe(Object.assign({}, sage, { kind: 'nope' }), sage.city).reason).toBe('bad-kind');
    expect(E.canServe(null, '泉州').reason).toBe('unknown');
  });
});

describe('city-envoy 换任与历任', () => {
  beforeEach(() => { makeStorage(); });

  test('默认在任即各城第一位历史人物', () => {
    E.CITIES.forEach(c => {
      const first = E.ENVOYS.filter(e => e.city === c && e.kind === 'sage')[0];
      const cur = E.envoyOf(c);
      if (first) expect(cur.id).toBe(first.id);
      else expect(cur).toBeNull();
    });
  });

  test('换任成功并记入历任', () => {
    const others = E.envoysOfCity('龙岩');
    expect(others.length).toBeGreaterThan(0);
    // 造一位同城的历史人物（复用既有条目字段，换成另一个 id）
    const base = others[0];
    const swapped = Object.assign({}, base, { id: 'ly-alt', name: '另一位' });
    E.ENVOYS.push(swapped);
    const prev = E.envoyOf('龙岩').id;
    const r = E.setEnvoy('龙岩', 'ly-alt');
    expect(r.ok).toBe(true);
    expect(r.replaced.id).toBe(prev);
    expect(E.envoyOf('龙岩').id).toBe('ly-alt');
    const h = E.historyOf('龙岩');
    expect(h.length).toBe(1);
    expect(h[0].id).toBe(prev);
    expect(h[0].replacedBy).toBe('ly-alt');
    E.ENVOYS.pop();
  });

  test('重复任命同一人返回 already-serving', () => {
    const cur = E.envoyOf('泉州').id;
    expect(E.setEnvoy('泉州', cur).reason).toBe('already-serving');
  });

  test('人城不匹配被拒', () => {
    expect(E.setEnvoy('泉州', 'fz-linzexu').reason).toBe('city-mismatch');
  });

  test('未知城市 / 未知代言人被拒', () => {
    expect(E.setEnvoy('火星', 'fz-linzexu').reason).toBe('unknown-city');
    expect(E.setEnvoy('泉州', 'nope').reason).toBe('unknown');
  });

  test('在世未授权者无法通过 setEnvoy 上岗', () => {
    const bad = liveFixture({ id: 'qz-badhost', authorization: 'pending' });
    E.ENVOYS.push(bad);
    expect(E.setEnvoy('泉州', 'qz-badhost').reason).toBe('unauthorized');
    expect(E.envoyOf('泉州').id).not.toBe('qz-badhost');
    E.ENVOYS.pop();
  });

  test('撤席后该城进入空缺，并留下离任记录', () => {
    const before = E.envoyOf('漳州').id;
    const r = E.vacate('漳州');
    expect(r.ok).toBe(true);
    expect(E.envoyOf('漳州')).toBeNull();
    expect(E.vacantCities()).toContain('漳州');
    expect(E.historyOf('漳州')[0].id).toBe(before);
    expect(E.vacate('漳州').reason).toBe('already-vacant');
  });

  test('resetAll 回到默认在任表', () => {
    E.vacate('漳州');
    expect(E.envoyOf('漳州')).toBeNull();
    E.resetAll();
    expect(E.envoyOf('漳州')).toBeTruthy();
    expect(E.historyOf('漳州')).toEqual([]);
  });
});

describe('city-envoy 合规边界', () => {
  beforeEach(() => { makeStorage(); });

  test('代言人条目不含任何商品 / 价格 / 链接字段（不做带货背书）', () => {
    const banned = ['product', 'productId', 'sku', 'skuId', 'price', 'buyUrl', 'link', 'cart', 'coupon'];
    E.ENVOYS.forEach(e => {
      Object.keys(e).forEach(k => {
        expect(banned).not.toContain(k);
      });
    });
  });

  test('三槽内容齐备，且不含改运 / 必应类表述', () => {
    const banned = ['改运', '逆天', '必应', '转运', '开光', '灵验'];
    E.ENVOYS.forEach(e => {
      [e.line, e.deed, e.lore, e.title].forEach(t => {
        expect(typeof t).toBe('string');
        expect(t.length).toBeGreaterThan(0);
        banned.forEach(b => { expect(t.indexOf(b)).toBe(-1); });
      });
    });
  });

  test('verify 取值受控，pending 条目能被 needsVerify 汇总', () => {
    E.ENVOYS.forEach(e => { expect(['ok', 'pending']).toContain(e.verify); });
    const nv = E.needsVerify();
    expect(nv.length).toBe(E.ENVOYS.filter(e => e.verify !== 'ok').length);
    nv.forEach(x => { expect(typeof x.source).toBe('string'); expect(x.source.length).toBeGreaterThan(0); });
  });

  test('isLive / tenureOf 与席位种类一致', () => {
    expect(E.isLive({ kind: 'sage' })).toBe(false);
    expect(E.isLive({ kind: 'host' })).toBe(true);
    expect(E.isLive({ kind: 'keeper' })).toBe(true);
    expect(E.tenureOf({ kind: 'sage' })).toBe('perpetual');
    expect(E.tenureOf({ kind: 'host' })).toBe('term');
    expect(E.kindOf('nope')).toBeNull();
  });
});
