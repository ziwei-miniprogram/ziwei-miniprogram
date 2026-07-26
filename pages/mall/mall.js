const { products } = require('../../utils/mock.js');
const social = require('../../utils/social.js');
const checkin = require('../../utils/checkin.js');

// P0：首批限定款（与文旅城市呼应，优先购资格可抢）。后续接后端后可按标记返回。
const LIMITED_IDS = [1, 4]; // ① 紫微星象紫水晶簇 ② 敦煌星图游学线路

// P1：限定款开售时间（演示：相对当前时间的未来时刻，真机应取自后端）
// 库存稀缺框架：未到开售显示倒计时，到点自动转为「优先购」角标
function buildSaleMap() {
  const now = Date.now();
  return { 1: now + 60 * 1000, 4: now + 5 * 60 * 1000 };
}

Page({
  data: {
    cats: ['全部', '水晶', '香薰', '书籍', '线路', '文创', '课程'],
    cat: '全部',
    list: [],
    allList: [],
    theme: 'light',
    // —— 文旅打卡 P0/P1 ——
    couponCount: 0,
    hasPriority: false,
    priorityText: '0:00:00',
    saleMap: {},
    // —— P2：晒单返星屑 ——
    shareReturn: checkin.SHARE_RETURN,
    sharedTitles: [],
    shareRemain: checkin.SHARE_DAILY_LIMIT
  },
  onLoad() {
    const saleMap = buildSaleMap();
    const all = products.map(p => Object.assign({}, p, {
      cost: p.meritCost || p.price,
      limited: LIMITED_IDS.indexOf(p.id) >= 0,
      onSaleAt: saleMap[p.id] || 0
    }));
    this.setData({ allList: all, saleMap });
    this.buildList();
  },
  onShow() {
    const app = getApp();
    app.applyTheme();
    this.setData({ theme: app.getTheme() });
    this.refreshShared();
    this.refreshCheckin();
  },
  // P2：同步已晒单集合 + 今日剩余晒单额度
  refreshShared() {
    const shared = checkin.sharesSnapshot();
    const can = checkin.canShare();
    this.setData({ sharedTitles: shared, shareRemain: can.remain });
  },
  // 顶部折扣/优先购状态 + 每款角标（开售倒计时 / 优先购 / 原 badge）每秒刷新
  refreshCheckin() {
    this.buildList();
    this.setData({
      couponCount: checkin.couponCount(),
      hasPriority: checkin.hasPriority(),
      priorityText: checkin.priorityRemainText()
    });
    if (this._timer) clearInterval(this._timer);
    // 任一限定款未开售，或优先购资格有效 → 持续走秒
    const hasPending = this.data.allList.some(p => p.limited && p.onSaleAt > Date.now());
    if (hasPending || checkin.hasPriority()) {
      this._timer = setInterval(() => {
        this.buildList();
        this.setData({ priorityText: checkin.priorityRemainText(), hasPriority: checkin.hasPriority() });
        const stillPending = this.data.allList.some(p => p.limited && p.onSaleAt > Date.now());
        if (!stillPending && !checkin.hasPriority()) clearInterval(this._timer);
      }, 1000);
    }
  },
  onHide() { if (this._timer) { clearInterval(this._timer); this._timer = null; } },
  onUnload() { if (this._timer) { clearInterval(this._timer); this._timer = null; } },
  // 组装列表：计算每款角标文本与样式（开售倒计时 > 优先购 > 原 badge）
  buildList() {
    const cat = this.data.cat;
    const hasPriority = checkin.hasPriority();
    const now = Date.now();
    const shared = this.data.sharedTitles || [];
    const list = this.data.allList
      .filter(p => cat === '全部' || p.tag === cat)
      .map(p => {
        const np = Object.assign({}, p);
        if (p.limited && p.onSaleAt > now) {
          np.onSaleText = saleCountdown(p.onSaleAt - now); // 开售倒计时
          np.badgeText = np.onSaleText;
          np.badgeCls = 'badge-sale';
        } else if (p.limited && hasPriority) {
          np.onSaleText = '';
          np.badgeText = '优先购';
          np.badgeCls = 'badge-prio';
        } else {
          np.onSaleText = '';
          np.badgeText = p.badge || '';
          np.badgeCls = '';
        }
        // P2：已兑换商品可晒单（防重复）
        np.shared = shared.indexOf(p.title) >= 0;
        np.shareable = true;
        return np;
      });
    this.setData({ list });
  },
  switchCat(e) {
    this.setData({ cat: e.currentTarget.dataset.c });
    this.buildList();
  },
  // 用功德兑换（替代原微信支付）；拥有城市折扣券时自动 9 折抵扣
  exchange(e) {
    const i = e.currentTarget.dataset.index;
    const p = this.data.list[i];
    if (p.limited && p.onSaleAt > Date.now()) {
      wx.showToast({ title: '限定款未到开售时间', icon: 'none' });
      return;
    }
    const app = getApp();
    const d = checkin.discountCost(p.cost); // 城市守护折扣
    const finalCost = d.cost;
    if (app.globalData.merit < finalCost) {
      wx.showModal({
        title: '功德还差一点',
        content: `兑换「${p.title}」需 ${finalCost} 功德，当前 ${app.globalData.merit}。去星野做几件「日行一善」就能攒够，无需花钱～`,
        confirmText: '去积功德',
        success: (r) => { if (r.confirm) wx.navigateTo({ url: '/pages/merit/merit' }); }
      });
      return;
    }
    const discountTip = d.discounted ? `（城市守护折扣已抵扣，原 ${p.cost} 功德）` : '';
    wx.showModal({
      title: '用功德兑换',
      content: `「${p.title}」需 ${finalCost} 功德（零金钱交易）。${discountTip}确认兑换？`,
      confirmText: '确认兑换',
      success: (r) => {
        if (r.confirm && app.spendMerit(finalCost)) {
          wx.showToast({ title: `已兑换 · -${finalCost} 功德`, icon: 'none' });
          social.log(`用 ${finalCost} 功德兑换了「${p.title}」`, '/pages/mall/mall');
          this.refreshShared();
          this.buildList();
        }
      }
    });
  },
  // P2：晒单返星屑 —— 购买后分享，返功德 + 引导回星图复访打卡（闭环）
  doShare(e) {
    const i = e.currentTarget.dataset.index;
    const p = this.data.list[i];
    if (!p) return;
    if (this.data.sharedTitles.indexOf(p.title) >= 0) {
      wx.showToast({ title: '这件已晒过单啦', icon: 'none' });
      return;
    }
    const can = checkin.canShare();
    if (!can.ok) {
      wx.showToast({ title: '今日晒单返利已达上限', icon: 'none' });
      return;
    }
    const r = checkin.recordShare(p.title);
    if (!r.ok) return;
    const app = getApp();
    if (app.addMerit) app.addMerit(r.returned);
    whimsy.burst(this, { text: '星屑已归位 +' + r.returned + ' 功德', emoji: '✨' });
    this.refreshShared();
    this.buildList();
    wx.showModal({
      title: '晒单完成 ✨',
      content: `你分享的「${p.title}」已点亮更多星友的守护。星屑回馈 +${r.returned} 功德已到账。\n回到星图继续打卡，集齐 6 城解锁全国守护礼～`,
      confirmText: '去星图',
      cancelText: '留在本页',
      success: (m) => { if (m.confirm) wx.switchTab({ url: '/pages/tourism/tourism' }); }
    });
  }
});

// 开售倒计时友好文本（时:分:秒）
function saleCountdown(ms) {
  if (ms <= 0) return '';
  const h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  const m = Math.floor(ms / 60000);
  ms -= m * 60000;
  const s = Math.floor(ms / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return (h > 0 ? h + ':' : '') + `${pad(m)}:${pad(s)} 后开售`;
}
