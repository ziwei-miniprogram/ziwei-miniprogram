// 星夜物语卡片组件（视觉叙事 P0 标杆）
// 用法：<story-card host body sign actionText motif theme bind:tap="onTap" />
// 特性：双主题、astro 品牌图标母题、合规免责、整卡可点（triggerEvent tap）。
// 图标唯一来源：components/icon/icon（astro），不再维护第二套 SVG。
const MOTIF_ICON = { night: 'calm', lamp: 'lamp', star: 'star', paper: 'note', spark: 'star' };

Component({
  properties: {
    host: { type: String, value: '' },        // 引路人落款
    body: { type: String, value: '' },        // 宿物语正文
    sign: { type: String, value: '' },        // 今日星签
    actionText: { type: String, value: '去点灯' }, // 行动召唤
    motif: { type: String, value: 'night' },  // 母题：night/lamp/star
    theme: { type: String, value: 'light' }   // 明暗
  },
  data: { motifName: 'calm' },
  observers: {
    motif: function (motif) {
      this.setData({ motifName: MOTIF_ICON[motif || 'night'] || 'calm' });
    }
  },
  methods: {
    onTap() { this.triggerEvent('tap'); }
  }
});
