const { getLunar } = require('../../utils/lunar.js');
const { feed, followingFeed, videos, following } = require('../../utils/mock.js');
const social = require('../../utils/social.js');
const whimsy = require('../../utils/whimsy.js');

// 生成某月日历（周一起始，6 行 42 格，含上下月补位与今日高亮 + 农历小字）
function buildCalendar(year, month, today) {
  const first = new Date(year, month - 1, 1);
  const startWeekday = (first.getDay() + 6) % 7; // 周一=0
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevDays = new Date(year, month - 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    let d, dim = false;
    if (i < startWeekday) { d = prevDays - startWeekday + 1 + i; dim = true; }
    else if (i >= startWeekday + daysInMonth) { d = i - (startWeekday + daysInMonth) + 1; dim = true; }
    else { d = i - startWeekday + 1; }
    let lunarShort = '';
    if (!dim) {
      const L = getLunar(year, month, d);
      lunarShort = L.term || L.dayCn; // 节气优先，否则农历日
    }
    cells.push({ d, dim, today: !dim && d === today, lunarShort });
  }
  return cells;
}

// 把瀑布流分成左右两列（模拟 masonry）
function splitColumns(list) {
  const left = [], right = [];
  list.forEach((it, i) => (i % 2 === 0 ? left : right).push(it));
  return { left, right };
}

// 确定性天气（无 key 的优雅降级）：同一天稳定，次日变化，便于演示真实感。
function weatherFor(date) {
  const seed = date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
  const pool = [
    { temp: '22°', cond: '晴夜', icon: '🌙' },
    { temp: '24°', cond: '多云', icon: '⛅' },
    { temp: '19°', cond: '小雨', icon: '🌧' },
    { temp: '26°', cond: '晴', icon: '☀' },
    { temp: '21°', cond: '微风', icon: '🍃' },
    { temp: '18°', cond: '阵雨', icon: '🌦' },
    { temp: '23°', cond: '阴', icon: '☁' }
  ];
  return pool[seed % pool.length];
}

// 真实天气接入位：填 WEATHER_KEY 即启用（需在小程序后台配置 request 合法域名）。
// 返回 { temp, cond, icon } 或 null（继续走降级天气）。
const WEATHER_KEY = '';
function fetchWeather(lat, lng) {
  if (!WEATHER_KEY) return null;
  // 示例（和风天气）：wx.request({ url: `https://devapi.qweather.com/v7/weather/now?location=${lng},${lat}&key=${WEATHER_KEY}`, ... })
  // 城市名可由腾讯位置服务逆地理编码获得：https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=YOUR_GEO_KEY
  return null;
}

// 读取用户已发布的笔记（发布页写入 storage 'my_publishes'）
function getPublished() {
  try {
    const arr = wx.getStorageSync('my_publishes');
    if (Array.isArray(arr)) return arr;
  } catch (e) {}
  return [];
}

// 笔记 -> 发现流卡片（注入点赞/收藏状态 + 实时计数 + mine 标记）
function toCard(it) {
  const liked = social.isLiked(it.noteId);
  const collected = social.isCollected(it.noteId);
  return Object.assign({}, it, {
    liked, collected, mine: !!it.mine,
    likeNum: social.countStr(it.likes, liked ? 1 : 0),
    collectNum: social.countStr(it.collects || 0, collected ? 1 : 0)
  });
}

Page({
  data: {
    today: 23,
    tabs: ['关注', '发现', '视频'],
    tab: 1,
    calYear: 2026,
    calMonth: 7,
    left: [], right: [],
    fLeft: [], fRight: [],
    following: [],
    recommend: [],
    videos: [],
    loading: true,
    showTop: false,
    // 星夜祝福 Hero（含天气 + 万年历）
    heroBlessing: ['愿你所行皆坦途', '所念皆如愿'],
    weather: { city: '杭州', temp: '23°', cond: '晴夜', icon: '🌙' },
    solar: '7月23日 周四',
    lunar: '丙午年 · 六月初十',
    starTip: '今日星象 · 心静则明',
    cal: { month: '2026 年 7 月', days: [] },
    // 选中日宜忌（默认今日）
    selYiJi: { date: '', lunar: '', term: '', jianChu: '', yi: '', ji: '' },
    merit: 0,
    level: { name: '善信' },
    checkedIn: false,
    showGuide: false,
    // —— 行为干预（P0）状态位 ——
    unlockCost: 30,
    unlockPct: 0,
    unlockHint: '',
    socialProof: '12,800+',
    wishes: [
      { k: '平静', emoji: '🌿', t: '内心平静' },
      { k: '连接', emoji: '🤝', t: '与人连接' },
      { k: '成长', emoji: '🌱', t: '持续成长' },
      { k: '善行', emoji: '🪔', t: '日行一善' }
    ],
    myWish: '',
    // —— 愉悦体验状态位 ——
    fx: [],
    dust: [],
    levelUp: null,
    rainbow: false,
    heroLit: false,
    heroBurst: null,
    theme: 'light',
    emptyFollow: '',
    // —— 入场「开窗」动画 ——
    winOpen: true,
    winStars: [],
    // —— P1-6 快捷发布 ——
    quickText: ''
  },

  onLoad() {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
    const L = getLunar(y, m, d);
    const weekNames = ['日', '一', '二', '三', '四', '五', '六'];
    const solar = `${m}月${d}日 周${weekNames[now.getDay()]}`;
    const starTip = L.term ? `今日节气 · ${L.term}` : '今日星象 · 心静则明';
    const cal = { year: y, month: `${y} 年 ${m} 月`, days: buildCalendar(y, m, d) };
    const w = weatherFor(now);
    const selYiJi = { date: `${m}月${d}日`, lunar: L.fullCn, term: L.term, jianChu: L.jianChu, yi: L.yi, ji: L.ji };
    this.setData({
      today: d, calYear: y, calMonth: m, solar, lunar: L.fullCn, starTip, cal,
      weather: { city: '杭州', ...w }, selYiJi
    });
    // 首启：预置默认关注（3 位星野引路人），打破社交冷启动
    let first = true;
    try { first = !wx.getStorageSync('first_launch'); } catch (e) {}
    if (first) social.ensureDefaultFollows();
    this.buildLists();
    this.setData({ showGuide: first });
    // 愉悦：每日祝福语随机轮换 + 空状态温柔文案 + Hero 星野渐显入场
    const app = getApp();
    // 入场「开窗」动画：生成星光粒子 + 仅冷启动播放一次（onLoad 在切 tab 不重触发）
    const winStars = [];
    for (let i = 0; i < 16; i++) {
      winStars.push({ id: i, x: (10 + Math.random() * 80).toFixed(1) + '%', y: (15 + Math.random() * 70).toFixed(1) + '%', d: (Math.random() * 0.8).toFixed(2) });
    }
    this.setData({
      heroBlessing: whimsy.randomBlessing(),
      emptyFollow: whimsy.COPY.empty.follow,
      theme: app.getTheme(),
      winStars,
      winOpen: true
    });
    // P0-1 进度虚高起点：新用户「星辉初光 +10」的星光反馈（一次性）
    if (app.globalData.welcomeGift) {
      const self = this;
      setTimeout(() => { whimsy.burst(self, { text: whimsy.COPY.welcome, emoji: '🌟' }); }, 900);
      app.globalData.welcomeGift = false;
    }
    const self = this;
    setTimeout(() => self.setData({ heroLit: true }), 60);
    // 入场「开窗」：窗扉滑开后撤掉遮罩（reduced-motion 下 CSS 已隐藏，此处静默移除）
    setTimeout(() => self.setData({ winOpen: false }), 1200);
    // Hero 星爆：窗口开启后接力放射（首屏一次性浪漫入场，尊重系统「减少动态效果」由 CSS 关闭）
    setTimeout(() => whimsy.heroBurst(self), 1180);
    // 首屏骨架屏：本地数据即时就绪，模拟一次轻量加载以呈现 shimmer 过渡
    setTimeout(() => this.setData({ loading: false }), 320);
  },

  onShow() {
    const app = getApp();
    app.applyTheme();
    this.setData({ theme: app.getTheme() });
    const m = app.globalData.merit;
    const cost = this.data.unlockCost;
    const pct = Math.min(100, Math.round(m / cost * 100));
    const toUnlock = Math.max(0, cost - m);
    let hint;
    if (toUnlock === 0) hint = '已可点亮深度解读 ✦';
    else if (pct >= 70) hint = `再攒 ${toUnlock} 即点亮深度解读 ✦`;
    else hint = `距深度解读还差 ${toUnlock} 功德`;
    this.setData({ merit: m, level: app.globalData.level, checkedIn: app.checkedInToday(), unlockPct: pct, unlockHint: hint });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().setData({ selected: 0 });
    this.buildLists();
  },

  // 下拉刷新：重建列表（重新读取已发布 / 社交状态）
  onPullDownRefresh() {
    this.buildLists();
    wx.stopPullDownRefresh();
    wx.showToast({ title: '星河常新 · 已刷新', icon: 'none' });
  },

  onPageScroll(e) {
    const show = e.scrollTop > 700;
    if (show !== this.data.showTop) this.setData({ showTop: show });
  },

  backTop() {
    wx.pageScrollTo({ scrollTop: 0, duration: 280 });
    this.setData({ showTop: false });
  },

  // 重建三栏列表：拼接已发布笔记 + 注入社交状态 + 实时计数
  buildLists() {
    const pub = getPublished().map(p => ({
      id: p.id, emoji: p.emoji, bg: p.bg, title: p.title, author: p.author,
      likes: p.likes, collects: p.collects, topic: p.topic, h: p.h, noteId: p.id, mine: true
    }));
    const feedAll = pub.concat(feed).map(toCard);
    const { left, right } = splitColumns(feedAll);
    const fAll = followingFeed.map(toCard);
    const fl = splitColumns(fAll);
    const vAll = videos.map(v => {
      const liked = social.isLiked('v' + v.id);
      return Object.assign({}, v, {
        liked, ref: 'v' + v.id,
        likeNum: social.countStr(v.likes || 0, liked ? 1 : 0)
      });
    });
    const foll = following.map(f => Object.assign({}, f, { followed: social.isFollowed(f.name) }));
    const rec = foll.filter(f => !f.followed);
    this.setData({ left, right, fLeft: fl.left, fRight: fl.right, videos: vAll, following: foll, recommend: rec });
  },

  switchTab(e) { this.setData({ tab: Number(e.currentTarget.dataset.i) }); },

  // 点击日历某天，展示该日宜忌
  pickDay(e) {
    const d = Number(e.currentTarget.dataset.d);
    if (!d) return;
    const y = this.data.calYear, m = this.data.calMonth;
    const L = getLunar(y, m, d);
    this.setData({
      selYiJi: { date: `${m}月${d}日`, lunar: L.fullCn, term: L.term, jianChu: L.jianChu, yi: L.yi, ji: L.ji }
    });
  },

  // 真实定位（降级为演示城市）。success 时把城市标记为「我的位置」以体现定位生效。
  refreshWeather() {
    const self = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        const w = fetchWeather(res.latitude, res.longitude);
        if (w) self.setData({ weather: Object.assign({}, self.data.weather, w, { city: '我的位置' }) });
        else self.setData({ 'weather.city': '我的位置' });
        wx.showToast({ title: '已定位 · 天气待接入 API', icon: 'none' });
      },
      fail() {
        wx.showToast({ title: '未授权定位，展示演示天气', icon: 'none' });
      }
    });
  },

  // ===== 社交互动：点赞 / 收藏 / 关注，联动功德 =====
  onLike(e) {
    const ref = e.currentTarget.dataset.ref;
    const app = getApp();
    const before = app.globalData.level;
    const r = social.toggleLike(ref);
    const after = app.globalData.level;
    if (r.active) whimsy.afterMerit(this, before, after, 1, 'like');
    else wx.showToast({ title: '已取消点赞', icon: 'none' });
    this.afterSocial();
  },
  onCollect(e) {
    const ref = e.currentTarget.dataset.ref;
    const app = getApp();
    const before = app.globalData.level;
    const r = social.toggleCollect(ref);
    const after = app.globalData.level;
    if (r.active) whimsy.afterMerit(this, before, after, 1, 'collect');
    else wx.showToast({ title: '已取消收藏', icon: 'none' });
    this.afterSocial();
  },
  onToggleFollow(e) {
    const name = e.currentTarget.dataset.name;
    const app = getApp();
    const before = app.globalData.level;
    const r = social.toggleFollow(name);
    const after = app.globalData.level;
    if (r.active) whimsy.afterMerit(this, before, after, 1, 'follow');
    else wx.showToast({ title: '已取消关注', icon: 'none' });
    this.afterSocial();
  },
  afterSocial() {
    const app = getApp();
    this.buildLists();
    this.setData({ merit: app.globalData.merit, level: app.globalData.level });
  },

  lightLamp() {
    const app = getApp();
    const before = app.globalData.level;
    app.addMerit(1, '点灯');
    const after = app.globalData.level;
    this.setData({ merit: app.globalData.merit, level: after });
    whimsy.afterMerit(this, before, after, 1, 'lamp');
    whimsy.stardust(this, { x: '50%', y: '30%' });
  },
  checkin() {
    const app = getApp();
    const before = app.globalData.level;
    const r = app.doCheckin();
    if (!r.ok) { wx.showToast({ title: whimsy.COPY.error.signed, icon: 'none' }); return; }
    const after = app.globalData.level;
    this.setData({ merit: app.globalData.merit, level: after, checkedIn: true });
    whimsy.afterMerit(this, before, after, r.gain, 'checkin');
    // P1-1 连签里程碑飘星
    if (r.milestone) whimsy.burst(this, { text: `连签 ${r.milestone.streak} 天 · 里程碑 +${r.milestone.bonus} 🎉`, emoji: '🏆' });
  },
  // 彩蛋：连点 Hero 星空 ×5 → 星河贯通（彩虹星模式）
  onHeroTap() {
    this._taps = (this._taps || 0) + 1;
    clearTimeout(this._tapTimer);
    if (this._taps >= 5) { this._taps = 0; whimsy.rainbow(this); return; }
    this._tapTimer = setTimeout(() => { this._taps = 0; }, 1200);
  },
  openNote(e) { wx.navigateTo({ url: '/pages/note/note?id=' + e.currentTarget.dataset.id }); },
  openVideo(e) { wx.showToast({ title: '视频播放 · 演示占位', icon: 'none' }); },
  goChart() { wx.navigateTo({ url: '/pages/chart/chart' }); },
  goTourism() { wx.switchTab({ url: '/pages/tourism/tourism' }); },
  goHealing() { wx.navigateTo({ url: '/pages/healing/healing' }); },
  goWish() { wx.navigateTo({ url: '/pages/merit/merit?tab=wish' }); },
  goMerit() { wx.navigateTo({ url: '/pages/merit/merit' }); },
  goSpace() { wx.switchTab({ url: '/pages/space/space' }); },
  goSearch() { wx.navigateTo({ url: '/pages/search/search' }); },
  onWish(e) {
    this.setData({ myWish: e.currentTarget.dataset.k });
  },
  finishGuide() {
    wx.setStorageSync('first_launch', '1');
    if (this.data.myWish) wx.setStorageSync('my_wish', this.data.myWish);
    this.setData({ showGuide: false });
    this.lightLamp();
  },
  closeGuide() {
    wx.setStorageSync('first_launch', '1');
    if (this.data.myWish) wx.setStorageSync('my_wish', this.data.myWish);
    this.setData({ showGuide: false });
  },
  goGuideSpace() { wx.switchTab({ url: '/pages/space/space' }); },

  // P1-6 快捷发布：首页直接「记一笔」，降低发布摩擦
  quickInput(e) { this.setData({ quickText: e.detail.value }); },
  quickPost() {
    const text = (this.data.quickText || '').trim();
    if (!text) { wx.showToast({ title: '写点什么再记一笔~', icon: 'none' }); return; }
    const emojis = ['🌌', '🔮', '🍃', '🏮', '🌙', '🌿', '🪔', '⭐'];
    const bgs = [
      'linear-gradient(140deg,#2b2b4e,#4a4a7a)',
      'linear-gradient(140deg,#3a3660,#6a5f96)',
      'linear-gradient(140deg,#7fb7a3,#a9d4c5)',
      'linear-gradient(140deg,#c8a35a,#e0c489)',
      'linear-gradient(140deg,#3b3a5c,#5b5a82)'
    ];
    const id = 900000 + Math.floor(Math.random() * 90000);
    const note = {
      id, title: text.slice(0, 20), body: text, author: '拾光的小野',
      likes: 0, collects: 0, topic: '随手记', h: 200 + Math.floor(Math.random() * 60),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      bg: bgs[Math.floor(Math.random() * bgs.length)], mine: true, t: '刚刚'
    };
    let arr = [];
    try { arr = wx.getStorageSync('my_publishes'); } catch (e) {}
    if (!Array.isArray(arr)) arr = [];
    arr.unshift(note);
    try { wx.setStorageSync('my_publishes', arr); } catch (e) {}
    const app = getApp();
    const before = app.globalData.level;
    app.addMerit(8, '发布过审');
    const after = app.globalData.level;
    social.log('随手记一笔 · +8 功德');
    this.setData({ quickText: '' });
    whimsy.afterMerit(this, before, after, 8, 'publish');
    this.buildLists();
  },
  onShareAppMessage() {
    return { title: '愿你所行皆坦途，所念皆如愿', path: '/pages/index/index' };
  }
});
