const { products } = require('../../utils/mock.js');
const social = require('../../utils/social.js');
const checkin = require('../../utils/checkin.js');

// P0：首批限定款（与文旅城市呼应，优先购资格可抢）。后续接后端后可按标记返回。
const LIMITED_IDS = [1, 4]; // ① 紫微星象紫水晶簇 ② 敦煌星图游学线路

Page({
  data: {
    cats: ['全部', '水晶', '香薰', '书籍', '线路', '文创', '课程'],
    cat: '全部',
    list: [],
    allList: [],
    theme: 'light',
    // —— 文旅打卡 P0 ——
    couponCount: 0,
    hasPriority: false,
    priorityText: '0:00:00'
  },
  onShow() {
    const app = getApp();
    app.applyTheme();
    this.setData({ theme: app.getTheme() });
    this.refreshCheckin();
  },
  onLoad() {
    // 商品以「功德」计价（零金钱交易）；meritCost 缺省时用 price 当功德价。
    const all = products.map(p => Object.assign({}, p, {
      cost: p.meritCost || p.price,
      limited: LIMITED_IDS.indexOf(p.id) >= 0
    }));
    this.setData({ allList: all, list: all });
  },
  // 顶部折扣/优先购状态刷新；优先购资格倒计时每秒走动（onHide 清除，省电）
  refreshCheckin() {
    this.setData({
      couponCount: checkin.couponCount(),
      hasPriority: checkin.hasPriority(),
      priorityText: checkin.priorityRemainText()
    });
    if (this._timer) clearInterval(this._timer);
    if (checkin.hasPriority()) {
      this._timer = setInterval(() => {
        this.setData({ priorityText: checkin.priorityRemainText(), hasPriority: checkin.hasPriority() });
        if (!checkin.hasPriority()) clearInterval(this._timer);
      }, 1000);
    }
  },
  onHide() { if (this._timer) { clearInterval(this._timer); this._timer = null; } },
  onUnload() { if (this._timer) { clearInterval(this._timer); this._timer = null; } },
  switchCat(e) {
    const cat = e.currentTarget.dataset.c;
    const all = this.data.allList;
    this.setData({ cat, list: cat === '全部' ? all : all.filter(p => p.tag === cat) });
  },
  // 用功德兑换（替代原微信支付）；拥有城市折扣券时自动 9 折抵扣
  exchange(e) {
    const i = e.currentTarget.dataset.index;
    const p = this.data.list[i];
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
        }
      }
    });
  }
});
