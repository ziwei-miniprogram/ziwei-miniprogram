// 单元测试：非遗主题星图（闽南文化生态保护区）收集机制
function makeStorage() {
  const m = {};
  global.wx = {
    getStorageSync: (k) => (k in m ? m[k] : ''),
    setStorageSync: (k, v) => { m[k] = v; }
  };
  return m;
}

const H = require('../utils/heritage-map.js');
const fujian = require('../utils/fujian-routes.js');

describe('heritage-map 数据结构', () => {
  beforeEach(() => { makeStorage(); });

  test('20 个节点，4 组各 5 个，无重复 id', () => {
    expect(H.TOTAL).toBe(20);
    expect(H.GROUPS.length).toBe(4);
    const seen = {};
    H.NODES.forEach(n => {
      expect(seen[n.id]).toBeUndefined();
      seen[n.id] = true;
    });
    H.GROUPS.forEach(g => {
      expect(H.nodesByGroup(g.key).length).toBe(5);
    });
  });

  test('每个节点的地市都在线路站点覆盖范围内（否则行迹碎片永远拿不到）', () => {
    const spotCities = {};
    fujian.SPOTS.forEach(s => { spotCities[s.city] = true; });
    H.NODES.forEach(n => {
      expect(spotCities[n.city]).toBe(true);
    });
  });

  test('级别取值受控，避免出现未经核校的表述', () => {
    const allowed = ['世界级', '国家级', '省级'];
    H.NODES.forEach(n => { expect(allowed).toContain(n.level); });
  });
});

describe('heritage-map 收集机制', () => {
  beforeEach(() => { makeStorage(); });

  test('单一行为无法点亮任何一颗星（必须三类碎片齐备）', () => {
    H.NODES.forEach(n => H.addFragment(n.id, 'trace'));
    const st = H.state();
    expect(st.lit).toBe(0);
    expect(st.fragmentsTotal).toBe(20);
  });

  test('集齐三类碎片才点亮该节点', () => {
    expect(H.addFragment('nanyin', 'trace').nodeLit).toBe(false);
    expect(H.addFragment('nanyin', 'deed').nodeLit).toBe(false);
    const last = H.addFragment('nanyin', 'lore');
    expect(last.nodeLit).toBe(true);
    expect(last.count).toBe(3);
    expect(H.state().lit).toBe(1);
  });

  test('同类碎片重复加幂等，不叠加计数', () => {
    H.addFragment('nanyin', 'trace');
    const again = H.addFragment('nanyin', 'trace');
    expect(again.ok).toBe(false);
    expect(again.reason).toBe('dup');
    expect(H.fragmentsOf('nanyin').count).toBe(1);
  });

  test('未知节点 / 未知碎片类型被拒', () => {
    expect(H.addFragment('nope', 'trace').reason).toBe('unknown');
    expect(H.addFragment('nanyin', 'nope').reason).toBe('bad-kind');
  });

  test('一组 5 星全亮 → 该象成组', () => {
    const dy = H.nodesByGroup('dy');
    dy.forEach(n => {
      H.addFragment(n.id, 'trace');
      H.addFragment(n.id, 'deed');
      H.addFragment(n.id, 'lore');
    });
    const st = H.state();
    const g = st.groups.filter(x => x.key === 'dy')[0];
    expect(g.complete).toBe(true);
    expect(st.groupLit).toBe(1);
    expect(st.complete).toBe(false);
  });

  test('20 星全亮 → 星图整体点亮', () => {
    H.NODES.forEach(n => {
      H.addFragment(n.id, 'trace');
      H.addFragment(n.id, 'deed');
      H.addFragment(n.id, 'lore');
    });
    const st = H.state();
    expect(st.lit).toBe(20);
    expect(st.groupLit).toBe(4);
    expect(st.complete).toBe(true);
    expect(st.next).toBeNull();
    expect(st.fragmentsTotal).toBe(60);
  });

  test('未点亮时给出下一颗最接近点亮的星（目标梯度）', () => {
    H.addFragment('nanyin', 'trace');
    H.addFragment('nanyin', 'deed');
    H.addFragment('huian', 'trace');
    const st = H.state();
    expect(st.next.id).toBe('nanyin');
    expect(st.next.remain).toBe(1);
  });
});

describe('heritage-map 与线路打卡联动', () => {
  beforeEach(() => { makeStorage(); });

  test('打卡泉州站点，给全部泉州非遗节点发行迹碎片', () => {
    const quanzhouNodes = H.nodesByCity('泉州');
    expect(quanzhouNodes.length).toBeGreaterThan(0);
    const r = H.grantSpotFragments('kaiyuan');
    expect(r.ok).toBe(true);
    expect(r.city).toBe('泉州');
    expect(r.granted.length).toBe(quanzhouNodes.length);
    quanzhouNodes.forEach(n => {
      expect(H.fragmentsOf(n.id).frags.trace).toBe(true);
    });
  });

  test('nodesBySpot 按站点所属地市匹配节点', () => {
    expect(H.nodesBySpot('gulangyu').map(n => n.city)).toEqual(
      H.nodesBySpot('gulangyu').map(() => '厦门')
    );
    expect(H.nodesBySpot('not-a-spot')).toEqual([]);
  });

  test('重复打卡同一站点不再发碎片（幂等）', () => {
    H.grantSpotFragments('kaiyuan');
    const again = H.grantSpotFragments('kaiyuan');
    expect(again.ok).toBe(false);
    expect(again.reason).toBe('all-dup');
  });

  test('打卡 + 善行 + 知见三条线走通 → 首颗星点亮', () => {
    H.grantSpotFragments('kaiyuan');            // 泉州 → 行迹
    H.addFragment('nanyin', 'deed');            // 善行
    const last = H.addFragment('nanyin', 'lore');
    expect(last.nodeLit).toBe(true);
  });

  test('未知站点被拒', () => {
    const r = H.grantSpotFragments('nope');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('unknown-spot');
  });

  test('resetAll 清空星图存储', () => {
    H.addFragment('nanyin', 'trace');
    H.resetAll();
    expect(H.state().fragmentsTotal).toBe(0);
    expect(H.fragmentsOf('nanyin').count).toBe(0);
  });
});

describe('heritage-map 其他契约', () => {
  beforeEach(() => { makeStorage(); });

  test('存储键独立，不与线路层 / 城市层混用', () => {
    const m = makeStorage();
    H.addFragment('nanyin', 'trace');
    expect(Object.keys(m)).toEqual([H.KEY]);
    expect(H.KEY).not.toBe(fujian.KEY);
  });

  test('nodeById / groupOf 对未知 id 返回 null', () => {
    expect(H.nodeById('nope')).toBeNull();
    expect(H.groupOf('nope')).toBeNull();
    expect(H.groupOf('nanyin').key).toBe('dy');
  });

  test('初始状态为空星图', () => {
    const st = H.state();
    expect(st.lit).toBe(0);
    expect(st.fragmentsTotal).toBe(0);
    expect(st.groupLit).toBe(0);
    expect(st.next).toBeTruthy();
  });
});

describe('heritage-map 知见（文化小问）', () => {
  beforeEach(() => { makeStorage(); });

  test('20 个节点每题配套，选项齐备且不重复', () => {
    H.NODES.forEach(n => {
      const z = H.quizOf(n.id);
      expect(z).toBeTruthy();
      expect(typeof z.q).toBe('string');
      expect(z.q.length).toBeGreaterThan(4);
      expect(z.opts.length).toBe(4);
      expect(new Set(z.opts).size).toBe(4);
    });
  });

  test('quizOf 不下发正确项（视图层看不出答案）', () => {
    const z = H.quizOf('nanyin');
    expect(z.a).toBeUndefined();
    expect(Object.keys(z).sort()).toEqual(['nodeId', 'opts', 'q']);
  });

  test('答错不发碎片，也不回正确项', () => {
    const r = H.answerQuiz('nanyin', 2);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('wrong');
    expect(r.correct).toBe(false);
    expect(H.fragmentsOf('nanyin').count).toBe(0);
  });

  test('答对得「知见」碎片', () => {
    const r = H.answerQuiz('nanyin', 0);
    expect(r.ok).toBe(true);
    expect(r.correct).toBe(true);
    expect(H.fragmentsOf('nanyin').frags.lore).toBe(true);
  });

  test('答错不锁题，可重答直至答对', () => {
    H.answerQuiz('nanyin', 1);
    expect(H.fragmentsOf('nanyin').count).toBe(0);
    expect(H.answerQuiz('nanyin', 0).ok).toBe(true);
  });

  test('重复答对同一题不叠加碎片', () => {
    H.answerQuiz('nanyin', 0);
    const again = H.answerQuiz('nanyin', 0);
    expect(again.ok).toBe(false);
    expect(again.reason).toBe('dup');
    expect(again.correct).toBe(true);
    expect(H.fragmentsOf('nanyin').count).toBe(1);
  });

  test('未知节点 / 越界选项被拒', () => {
    expect(H.answerQuiz('nope', 0).reason).toBe('unknown');
    expect(H.answerQuiz('nanyin', 99).reason).toBe('wrong');
  });

  test('答对最后一枚碎片时回报节点点亮', () => {
    H.addFragment('nanyin', 'trace');
    H.addFragment('nanyin', 'deed');
    const r = H.answerQuiz('nanyin', 0);
    expect(r.nodeLit).toBe(true);
  });
});

describe('heritage-map 善行（愿星机制）', () => {
  beforeEach(() => { makeStorage(); });

  test('未立愿星时，善行归给最接近点亮的那颗', () => {
    H.addFragment('nanyin', 'trace');
    H.addFragment('nanyin', 'lore');          // nanyin 2/3，最接近
    H.addFragment('huian', 'trace');          // huian 1/3
    const r = H.grantDeed();
    expect(r.ok).toBe(true);
    expect(r.node.id).toBe('nanyin');
    expect(r.nodeLit).toBe(true);
  });

  test('立愿星后，善行优先归愿星（即使它不是最接近点亮的）', () => {
    H.addFragment('huian', 'trace');
    H.addFragment('huian', 'lore');           // huian 2/3，本该是默认目标
    H.addFragment('nanyin', 'trace');         // nanyin 1/3
    expect(H.setPledge('nanyin').ok).toBe(true);
    expect(H.pledgeOf()).toBe('nanyin');
    expect(H.grantDeed().node.id).toBe('nanyin');
  });

  test('一天一枚：连发两次落在不同的星上（发完自动轮换）', () => {
    const a = H.grantDeed();
    const b = H.grantDeed();
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(a.node.id).not.toBe(b.node.id);
    expect(H.state().fragmentsTotal).toBe(2);
  });

  test('善行碎片不会叠加在同一颗星上', () => {
    H.grantDeed(); H.grantDeed(); H.grantDeed();
    const withDeed = H.NODES.filter(n => H.fragmentsOf(n.id).frags.deed);
    expect(withDeed.length).toBe(3);
  });

  test('单靠善行永远点不亮任何一颗星', () => {
    for (let i = 0; i < 20; i++) H.grantDeed();
    const st = H.state();
    expect(st.lit).toBe(0);
    expect(st.fragmentsTotal).toBe(20);
  });

  test('20 星都拿到善行碎片后不再重复发放', () => {
    for (let i = 0; i < 20; i++) H.grantDeed();
    const r = H.grantDeed();
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('no-target');
  });

  test('setPledge 拒绝未知节点', () => {
    expect(H.setPledge('nope').reason).toBe('unknown');
    expect(H.pledgeOf()).toBeNull();
  });

  test('resetAll 同时清掉愿星', () => {
    H.setPledge('nanyin');
    H.grantDeed();
    expect(H.pledgeOf()).toBeTruthy();
    H.resetAll();
    expect(H.pledgeOf()).toBeNull();
    expect(H.state().fragmentsTotal).toBe(0);
  });

  test('rawFrags 与 computeState 输入一致', () => {
    H.grantDeed();
    const f = H.rawFrags();
    expect(Object.keys(f).length).toBe(1);
    expect(H.computeState(f).fragmentsTotal).toBe(1);
    expect(H.state().fragmentsTotal).toBe(H.computeState(H.rawFrags()).fragmentsTotal);
  });
});

// 这一组是「接线契约」测试：数据层推绿 ≠ 页面接上了。
// 起因是一次真实事故——手动打卡与 GPS 打卡两处接线并发修改，
// 其中一处被另一处覆盖，数据层 36 例全绿但用户手动打卡拿不到行迹碎片。
// 所以这里直接对页面源码断言三处接线存在，宁可断言弱，也不让接线悄悄消失。
describe('heritage-map 三条碎片来源的页面接线契约', () => {
  const fs = require('fs');
  const path = require('path');
  const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

  test('行迹：文旅页的手动打卡与 GPS 自动打卡都发碎片', () => {
    const src = read('pages/tourism/tourism.js');
    expect(src).toContain("require('../../utils/heritage-map.js')");
    expect(src).toContain('grantHeritageTrace(');
    // 两处入口都要接：手动点站点 + GPS 到访
    const calls = src.match(/grantHeritageTrace\(/g) || [];
    expect(calls.length).toBeGreaterThanOrEqual(3);   // 定义 1 次 + 调用 2 次
  });

  test('行迹：首次进入与打卡后都会重算星图（父页面把 frags 递给组件）', () => {
    const src = read('pages/tourism/tourism.js');
    expect(src).toContain('refreshHeritage()');
    expect(src).toContain('heritageFrags: heritage.rawFrags()');
    const wxml = read('pages/tourism/tourism.wxml');
    expect(wxml).toContain('<heritage-map');
    expect(wxml).toContain('frags="{{heritageFrags}}"');
    expect(wxml).toContain('bind:change="onHeritageChange"');
  });

  test('善行：今日三善完成时发碎片（接在已存在的三善判定上，不新增入口）', () => {
    const src = read('pages/merit/merit.js');
    expect(src).toContain("require('../../utils/heritage-map.js')");
    expect(src).toContain('heritage.grantDeed()');
    expect(src).toContain('count >= 3');
  });

  test('知见：答题走组件内的 answerQuiz，并且不下发正确项', () => {
    const js = read('components/heritage-map/heritage-map.js');
    expect(js).toContain('hm.answerQuiz(');
    expect(js).toContain('hm.quizOf(');
    const wxml = read('components/heritage-map/heritage-map.wxml');
    expect(wxml).toContain('bindtap="pickOpt"');
  });
});
