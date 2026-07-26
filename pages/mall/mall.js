const { products } = require('../../utils/mock.js');
const social = require('../../utils/social.js');

Page({
  data: {
    cats: ['全部', '水晶', '香薰', '书籍', '线路', '文创', '课程'],
    cat: '全部',
    list: [],
    allList: [],
    theme: 'light'
  },
  onShow() {
    const app = getApp();
    app.applyTheme();
    this.setData({ theme: app.getTheme() });
  },
  onLoad() {
    // 商品以「功德」计价（零金钱交易）；meritCost 缺省时用 price 当功德价。
    const all = products.map(p => Object.assign({}, p, { cost: p.meritCost || p.price }));
    this.setData({ allList: all, list: all });
  },
  switchCat(e) {
    const cat = e.currentTarget.dataset.c;
    const all = this.data.allList;
    this.setData({ cat, list: cat === '全部' ? all : all.filter(p => p.tag === cat) });
  },
  // 用功德兑换（替代原微信支付），不足引导去积功德
  exchange(e) {
    const i = e.currentTarget.dataset.index;
    const p = this.data.list[i];
    const app = getApp();
    if (app.globalData.merit < p.cost) {
      wx.showModal({
        title: '功德还差一点',
        content: `兑换「${p.title}」需 ${p.cost} 功德，当前 ${app.globalData.merit}。去星野做几件「日行一善」就能攒够，无需花钱～`,
        confirmText: '去积功德',
        success: (r) => { if (r.confirm) wx.navigateTo({ url: '/pages/merit/merit' }); }
      });
      return;
    }
    wx.showModal({
      title: '用功德兑换',
      content: `「${p.title}」需 ${p.cost} 功德（零金钱交易）。确认兑换？`,
      confirmText: '确认兑换',
      success: (r) => {
        if (r.confirm && app.spendMerit(p.cost)) {
          wx.showToast({ title: `已兑换 · -${p.cost} 功德`, icon: 'none' });
          social.log(`用 ${p.cost} 功德兑换了「${p.title}」`, '/pages/mall/mall');
        }
      }
    });
  }
});
