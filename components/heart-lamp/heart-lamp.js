// components/heart-lamp — 常驻心灯浮标（情感锚点）
// 提供「随时点灯 / 签到 / 记一笔」的低摩擦入口；灵动但不打扰。
const whimsy = require('../../utils/whimsy.js');

Component({
  properties: {
    // 由父级（如 tabBar）传入主题，确保切换时同步
    theme: {
      type: String,
      value: 'light',
      observer(t) { this.setData({ theme: t || 'light' }); }
    }
  },
  data: {
    merit: 0, streak: 0, checkedIn: false, theme: 'light', deedDoneAll: false,
    // 星野快捷 BottomSheet（UX 架构 P0-a，解 B2：高频 6 项 1 跳）
    quickOpen: false,
    quickItems: [
      { icon: '🔭', label: '星图', url: '/pages/chart/chart' },
      { icon: '🪔', label: '寄愿', url: '/pages/merit/merit?tab=wish' },
      { icon: '🌿', label: '三善', url: '/pages/merit/merit' },
      { icon: '🪔', label: '点灯', action: 'lamp' },
      { icon: '🛎', label: '签到', action: 'checkin' },
      { icon: '✍️', label: '记一笔', action: 'publish' }
    ]
  },

  pageLifetimes: {
    show() { this.sync(); }
  },
  lifetimes: {
    attached() { this.sync(); }
  },

  methods: {
    // 本日三善（点灯/随喜/冥想）是否皆已成 —— 用于心灯金色呼吸提醒
    _deedDoneAll(app) {
      const done = app.getDailyDeeds ? app.getDailyDeeds() : {};
      return !!(done && done.lamp && done.bond && done.meditate);
    },

    sync() {
      const app = getApp();
      if (!app || !app.globalData) return;
      this.setData({
        merit: app.globalData.merit,
        streak: app.globalData.streak,
        checkedIn: app.checkedInToday(),
        theme: app.getTheme(),
        deedDoneAll: this._deedDoneAll(app)
      });
    },

    onTap() {
      // 打开「星野快捷」BottomSheet（高频 6 项 1 跳）；再次点击由 mask 收起
      this.setData({ quickOpen: true });
    },

    // BottomSheet 内单点直达
    quickGo(e) {
      const item = e.currentTarget.dataset.item;
      const app = getApp();
      if (!app) { this.setData({ quickOpen: false }); return; }
      if (item.action === 'lamp') this.doLamp(app);
      else if (item.action === 'checkin') this.doCheckin(app);
      else if (item.action === 'publish') this.goPublish();
      else if (item.url) wx.navigateTo({ url: item.url });
      this.setData({ quickOpen: false });
    },

    closeQuick() { this.setData({ quickOpen: false }); },
    noop() {},

    // 在当前页面实例上触发愉悦反馈（fx 浮层由页面渲染）
    _page() {
      const pages = getCurrentPages();
      return pages && pages.length ? pages[pages.length - 1] : null;
    },

    doLamp(app) {
      const page = this._page();
      const before = app.globalData.level;
      app.addMerit(1, '点灯');
      app.markDailyDeed('lamp'); // 计为今日「点灯」一善，推进三善进度
      const after = app.globalData.level;
      if (page && page.setData) {
        whimsy.afterMerit(page, before, after, 1, 'lamp');
        whimsy.stardust(page, { x: '85%', y: '82%' });
      }
      this.sync();
    },

    doCheckin(app) {
      const page = this._page();
      const before = app.globalData.level;
      const res = app.doCheckin();
      if (!res.ok) { wx.showToast({ title: whimsy.COPY.error.signed, icon: 'none' }); return; }
      const after = app.globalData.level;
      if (page && page.setData) {
        whimsy.afterMerit(page, before, after, res.gain, 'checkin');
        whimsy.stardust(page, { x: '85%', y: '82%' });
        if (res.milestone) whimsy.burst(page, { text: `连签 ${res.milestone.streak} 天 · 里程碑 +${res.milestone.bonus} 🎉`, emoji: '🏆' });
      }
      this.sync();
    },

    goPublish() {
      wx.navigateTo({ url: '/pages/publish/publish' });
    }
  }
});
