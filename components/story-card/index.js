// 星夜物语卡片组件（视觉叙事 P0 标杆）
// 用法：<story-card host body sign actionText motif theme bind:tap="onTap" />
// 特性：双主题、线性 SVG 母题、合规免责、整卡可点（triggerEvent tap）。
const { motifIcon } = require('../../utils/icons.js');

Component({
  properties: {
    host: { type: String, value: '' },        // 引路人落款
    body: { type: String, value: '' },        // 宿物语正文
    sign: { type: String, value: '' },        // 今日星签
    actionText: { type: String, value: '去点灯' }, // 行动召唤
    motif: { type: String, value: 'night' },  // 母题：night/lamp/star
    theme: { type: String, value: 'light' }   // 明暗
  },
  data: { motifSrc: '' },
  observers: {
    'theme,motif': function () {
      const theme = this.data.theme || 'light';
      const motif = this.data.motif || 'night';
      this.setData({ motifSrc: motifIcon(motif, theme) });
    }
  },
  methods: {
    onTap() { this.triggerEvent('tap'); }
  }
});
