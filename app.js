const { levelOf } = require('./utils/merit.js');
const social = require('./utils/social.js');

const MERIT_KEY = 'merit_state';

// P1-1 连签里程碑：到达指定连签天数时赠里程碑礼（虚拟赠送，非金钱）
const MILESTONES = { 3: 2, 7: 3, 14: 5, 21: 5, 30: 8 };

App({
  globalData: {
    userInfo: null,
    // 取消内容付费后，会员/VIP 概念移除，改为功德系统
    merit: 0,
    streak: 0,            // 连续签到天数
    lastCheckin: '',      // 上次签到日期 YYYY-MM-DD
    level: levelOf(0),
    unread: 0,            // 消息中心未读数（红点驱动）
    theme: 'light',       // 主题：light（暖纸）/ dark（夜灯）
    // —— 惊喜盲盒门控 ——
    _hidden: false,       // 是否曾退到后台
    _hiddenAt: 0,         // 退后台时间戳
    _surprisePending: false // 待展示惊喜（仅冷启动 / 前台返回>30min 触发）
  },

  onLaunch() {
    // 实际项目中从后端/云开发拉取；此处为 MVP 演示，本地持久化
    this.loadMerit();
    // 主题持久化：恢复用户上次选择的明暗
    try {
      const t = wx.getStorageSync('app_theme');
      if (t === 'dark' || t === 'light') this.globalData.theme = t;
    } catch (e) {}
    // P0-1 进度虚高起点：首次进入赠「星辉初光 +10 功德」（明确为赠送，非充值）
    if (!wx.getStorageSync(MERIT_KEY)) {
      this.addMerit(10, '星辉初光');
      this.globalData.welcomeGift = true;
    }
  },

  // 每次打开小程序：冷启动 / 从后台返回，触发「惊喜盲盒」门控
  onShow() {
    const g = this.globalData;
    const wasHidden = g._hidden;
    g._hidden = false;
    if (!wasHidden) {
      // 冷启动首次打开
      g._surprisePending = true;
    } else {
      // 从后台返回：间隔 > 30 分钟再给一次惊喜，避免频繁打断
      const gap = Date.now() - (g._hiddenAt || 0);
      if (gap > 30 * 60 * 1000) g._surprisePending = true;
    }
  },

  onHide() {
    this.globalData._hidden = true;
    this.globalData._hiddenAt = Date.now();
  },

  // 消费一次惊喜（被 custom-tab-bar 在页面展示时调用，仅触发一次）
  consumeSurprise() {
    const p = this.globalData._surprisePending;
    this.globalData._surprisePending = false;
    return p;
  },

  // ===== 主题（暗色夜灯）控制 =====
  getTheme() {
    return this.globalData.theme || 'light';
  },
  setTheme(t) {
    if (t !== 'dark' && t !== 'light') return;
    this.globalData.theme = t;
    try { wx.setStorageSync('app_theme', t); } catch (e) {}
  },
  // 将当前主题同步到原生导航栏与背景（页面级调用）
  applyTheme() {
    const dark = this.getTheme() === 'dark';
    try {
      wx.setNavigationBarColor({
        frontColor: dark ? '#ffffff' : '#000000',
        backgroundColor: dark ? '#0B1426' : '#f7f5f0'
      });
      wx.setBackgroundColor({ backgroundColor: dark ? '#0B1426' : '#f7f5f0' });
    } catch (e) {}
  },

  loadMerit() {
    try {
      const s = wx.getStorageSync(MERIT_KEY);
      if (s && typeof s.merit === 'number') {
        this.globalData.merit = s.merit;
        this.globalData.streak = s.streak || 0;
        this.globalData.lastCheckin = s.lastCheckin || '';
      }
    } catch (e) {}
    this.globalData.level = levelOf(this.globalData.merit);
  },

  saveMerit() {
    try {
      wx.setStorageSync(MERIT_KEY, {
        merit: this.globalData.merit,
        streak: this.globalData.streak,
        lastCheckin: this.globalData.lastCheckin
      });
    } catch (e) {}
    this.globalData.level = levelOf(this.globalData.merit);
  },

  // P1-2 今日三善：每日完成的善行记录（按日期重置，每日每事限一次）
  saveDailyDeeds(d) {
    try { wx.setStorageSync('daily_deeds', d); } catch (e) {}
  },
  getDailyDeeds() {
    const today = this.todayStr();
    let d = {};
    try { d = wx.getStorageSync('daily_deeds'); } catch (e) {}
    if (!d || d.date !== today) { d = { date: today, done: {} }; this.saveDailyDeeds(d); }
    return d.done || {};
  },
  markDailyDeed(key) {
    const today = this.todayStr();
    let d = { date: today, done: {} };
    try { const x = wx.getStorageSync('daily_deeds'); if (x && x.date === today) d = x; } catch (e) {}
    d.done[key] = true;
    this.saveDailyDeeds(d);
    return d.done;
  },

  // 增加功德（禁止购买/充值）。返回最新等级。
  addMerit(n, reason) {
    this.globalData.merit += n;
    this.saveMerit();
    return this.globalData.level;
  },

  // 消耗功德解锁内容（非金钱），不足时返回 false。
  spendMerit(n) {
    if (this.globalData.merit < n) return false;
    this.globalData.merit -= n;
    this.saveMerit();
    return true;
  },

  // 今日是否已签到
  checkedInToday() {
    const d = this.todayStr();
    return this.globalData.lastCheckin === d;
  },

  // 签到：+3 基础，连续第 3 天起每多 1 天 +1，上限 +5
  doCheckin() {
    if (this.checkedInToday()) return { ok: false, gain: 0 };
    const d = this.todayStr();
    const yesterday = this.yesterdayStr();
    const last = this.globalData.lastCheckin;
    const wasBroken = !!last && last !== yesterday && last !== d; // 连签中断（火苗曾熄灭）
    this.globalData.streak = (last === yesterday) ? this.globalData.streak + 1 : 1;
    let gain = 3;
    if (this.globalData.streak >= 3) {
      gain = Math.min(5, 3 + (this.globalData.streak - 2));
    }
    let returnGift = false;
    if (wasBroken) {
      gain += 2; // 续火礼（虚拟赠送，非金钱）
      returnGift = true;
      social.log('心灯续火 · 续火礼 +2 功德，欢迎回来', '/pages/merit/merit');
      wx.showModal({
        title: '心灯已续火 🔥',
        content: '你的心灯曾熄了一阵，如今又亮了。续火礼 +2 功德已记入——明天也记得来点灯呀～',
        confirmText: '好的',
        showCancel: false
      });
    }
    // P1-1 连签里程碑：到达 3/7/14/21/30 天赠里程碑礼（断签后 streak 重置，不会误触发）
    let milestone = null;
    const msBonus = MILESTONES[this.globalData.streak];
    if (msBonus) {
      gain += msBonus;
      milestone = { streak: this.globalData.streak, bonus: msBonus };
      social.log(`连签 ${this.globalData.streak} 天 · 里程碑礼 +${msBonus} 功德 🎉`, '/pages/merit/merit');
    }
    this.globalData.lastCheckin = d;
    this.globalData.merit += gain;
    this.saveMerit();
    return { ok: true, gain, streak: this.globalData.streak, returnGift, milestone };
  },

  todayStr() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  },
  yesterdayStr() {
    const t = new Date(Date.now() - 86400000);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  },

  // 消息红点：累加未读（正向行为产生新动态时调用）
  bumpUnread(n) {
    const k = n || 1;
    this.globalData.unread = (this.globalData.unread || 0) + k;
  },

  // 进入消息中心后清零未读
  markRead() {
    this.globalData.unread = 0;
  }
});
