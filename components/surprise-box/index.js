// 惊喜盲盒：小程序每次打开时的礼物开启动画（视觉叙事 · 惊喜钩子）
// 用法（由 custom-tab-bar 挂载）：<surprise-box visible="{{surprise}}" bind:claim="onSurpriseClaim" bind:view="onSurpriseView" bind:close="onSurpriseClose" />
// 行为：visible=true 时展示闭合礼盒，轻触开启 → 盒盖掀起、星辉迸发 → 揭晓今日星礼（节气/二十八宿/幸运签/虚拟功德）。
// 合规：星礼为虚拟功德（非金钱、不可提现）；内容均为传统文化与心理慰藉的娱乐参考。
const daily = require('../../utils/daily-content.js');

// 盲盒揭晓峰值情境推荐（UX 架构 P0-d，解 B5）：按当日节气映射一件顺时结缘物
const TERM_RECO = {
  '夏至': { emoji: '☀️', name: '节气香 · 夏至长明', desc: '白昼最长，心灯亦长明' },
  '小暑': { emoji: '🌿', name: '节气香 · 小暑静气', desc: '暑气渐盛，先静一口气' },
  '大暑': { emoji: '🌿', name: '节气香 · 大暑清宁', desc: '一味线香，安住当下燥热' },
  '立秋': { emoji: '🍂', name: '节气香 · 立秋收心', desc: '把夏日的喧闹，收进一支香里' },
  '处暑': { emoji: '🍂', name: '节气香 · 处暑清凉', desc: '暑气止息，心亦清凉' },
  '白露': { emoji: '🌼', name: '节气香 · 白露润心', desc: '露从今夜白，香自静中生' }
};
function buildReco(box) {
  const m = TERM_RECO[box.term];
  const base = { tag: '星礼结缘', url: '/pages/mall/mall', cta: '去结缘' };
  if (m) return Object.assign(base, m);
  return Object.assign(base, {
    emoji: '🪔',
    name: box.term + ' · 顺时结缘物',
    desc: '把今日星礼的祝福，带一件回家'
  });
}

Component({
  properties: {
    visible: { type: Boolean, value: false }
  },
  data: {
    phase: 'closed',   // closed → opening → revealed
    box: null,
    burst: [],
    reduce: false,
    reco: null
  },
  observers: {
    visible(v) {
      if (v) this.prep();
      else this.setData({ phase: 'closed', box: null, reco: null });
    }
  },
  methods: {
    prep() {
      // 是否开启「减少动态效果」
      let reduce = false;
      try {
        const setting = wx.getSystemSetting && wx.getSystemSetting();
        if (setting && setting.reduceMotion === 'reduce') reduce = true;
      } catch (e) {}
      const box = daily.getSurprise();
      const reco = buildReco(box);
      const burst = [];
      for (let i = 0; i < 16; i++) {
        const ang = (Math.PI * 2 * i) / 16;
        burst.push({
          id: i,
          dx: (Math.cos(ang) * 200).toFixed(0) + 'rpx',
          dy: (Math.sin(ang) * 165).toFixed(0) + 'rpx',
          d: (Math.random() * 0.35).toFixed(2)
        });
      }
      this.setData({ phase: reduce ? 'revealed' : 'closed', box, burst, reduce, reco });
    },
    onTapBox() {
      if (this.data.phase !== 'closed') return;
      if (this.data.reduce) { this.setData({ phase: 'revealed' }); return; }
      this.setData({ phase: 'opening' });
      const self = this;
      setTimeout(() => self.setData({ phase: 'revealed' }), 820);
    },
    onClaim() {
      // 实际发放（按日限一次）+ 反馈由宿主 tab-bar 处理，组件仅透传奖励
      this.triggerEvent('claim', { reward: this.data.box.reward });
    },
    onView() {
      this.triggerEvent('view');
    },
    onClose() {
      this.triggerEvent('close');
    }
  }
});
