const { check, advice } = require('../../utils/censor.js');
const social = require('../../utils/social.js');
const whimsy = require('../../utils/whimsy.js');

const EMOJIS = ['🌌', '🔮', '🍃', '🏮', '🏜️', '🌙', '🌿', '♌', '🪔', '⭐'];
const BGS = [
  'linear-gradient(140deg,#2b2b4e,#4a4a7a)',
  'linear-gradient(140deg,#3a3660,#6a5f96)',
  'linear-gradient(140deg,#7fb7a3,#a9d4c5)',
  'linear-gradient(140deg,#b9544a,#e0796f)',
  'linear-gradient(140deg,#c8a35a,#e0c489)',
  'linear-gradient(140deg,#3b3a5c,#5b5a82)'
];

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    imgs: ['🌌', '🏔'],
    topics: ['星图旅行', '苍山', '心灵之旅', '疗愈', '寄愿', '共修'],
    picked: { '星图旅行': true, '苍山': true },
    title: '',
    body: '',
    place: '苍山 · 大理',
    star: '事业宫',
    // —— 愉悦状态位 ——
    fx: [],
    levelUp: null,
    theme: 'light'
  },
  onShow() {
  },
  toggleTopic(e) {
    const t = e.currentTarget.dataset.t;
    const picked = Object.assign({}, this.data.picked);
    if (picked[t]) delete picked[t]; else picked[t] = true;
    this.setData({ picked });
  },
  onTitle(e) { this.setData({ title: e.detail.value }); },
  onBody(e) { this.setData({ body: e.detail.value }); },
  chooseImg() { wx.showToast({ title: '选择图片（演示）', icon: 'none' }); },
  choosePlace() { wx.showToast({ title: '选择地点（演示）', icon: 'none' }); },
  chooseStar() { wx.showToast({ title: '关联星图（演示）', icon: 'none' }); },
  publish() {
    const title = (this.data.title || '').trim();
    const body = (this.data.body || '').trim();
    if (!title && !body) {
      wx.showToast({ title: '写点什么再发布吧~', icon: 'none' });
      return;
    }
    // 内容安全预检（本地演示版；生产应接微信内容安全 API）
    const c = check(title + ' ' + body + ' ' + Object.keys(this.data.picked).join(' '));
    if (!c.ok) {
      wx.showModal({
        title: '内容需调整',
        content: '检测到以下内容需修改，保持传统文化与友善分享：\n\n' + advice(c.hits),
        showCancel: false
      });
      return;
    }
    // 写入发现流（本地持久化，首页会自动拼到顶部）
    const id = 900000 + Math.floor(Math.random() * 90000);
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const bg = BGS[Math.floor(Math.random() * BGS.length)];
    const topicKeys = Object.keys(this.data.picked);
    const topic = topicKeys[0] || '星图旅行';
    const note = {
      id, title: title || body.slice(0, 12), body,
      author: '拾光的小野', likes: 0, collects: 0, topic,
      h: 200 + Math.floor(Math.random() * 60), emoji, bg, mine: true, t: '刚刚'
    };
    let arr = [];
    try { arr = wx.getStorageSync('my_publishes'); } catch (e) {}
    if (!Array.isArray(arr)) arr = [];
    arr.unshift(note);
    try { wx.setStorageSync('my_publishes', arr); } catch (e) {}
    // 功德联动：发布过审 +8
    const app = getApp();
    const before = app.globalData.level;
    app.addMerit(8, '发布过审');
    const after = app.globalData.level;
    social.log('发布过审感悟 · +8 功德');
    whimsy.afterMerit(this, before, after, 8, 'publish');
    setTimeout(() => wx.navigateBack(), 1100);
  }
});
