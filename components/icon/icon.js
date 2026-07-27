// 天体图谱图标系统 · 古星图手绘风（细金线 1.8 + 圆头 + 星芒点睛）
// 传 name + size + theme 返回内联 SVG data-URI（与 custom-tab-bar 同机制），
// 全站统一调用，告别 emoji 拼凑。浅底用 --gold-deep(#8a6a2a, AA) / 暗底用 --gold(#d9b66a)。
const COLORS = { light: '#8a6a2a', dark: '#d9b66a' };

// 24x24 viewBox；stroke 类默认描边，fill="currentColor" stroke="none" 为填充点睛（currentColor = 主题金）。
const ICONS = {
  // 点亮 / 心灯（四芒星芒）
  lamp: '<path d="M12 2l1.9 6.3L20 10l-6.1 1.7L12 18l-1.9-6.3L4 10l6.1-1.7z" fill="currentColor" stroke="none"/>',
  // 寄愿（卷轴 + 星）
  wish: '<path d="M7 4h10v15H7z"/><path d="M7 4c-1.4 0-2 1-2 2s.6 2 2 2"/><path d="M17 19c1.4 0 2-1 2-2s-.6-2-2-2"/><path d="M12 7.5l.8 1.9 2 .1-1.5 1.3.5 2-1.8-1.1-1.8 1.1.5-2-1.5-1.3 2-.1z" fill="currentColor" stroke="none"/>',
  // 三善（三光点）
  deeds: '<circle cx="6" cy="12" r="2.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="2.1" fill="currentColor" stroke="none"/>',
  // 分享（星轨节点）
  share: '<circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="6" r="2.3"/><circle cx="18" cy="18" r="2.3"/><path d="M8 11l8-4M8 13l8 4"/>',
  // 功德（光点 + 芒）
  merit: '<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  // 连签（连星）
  streak: '<path d="M7 4l.7 2 .8 2.2L11 8.7l-2 1.8.5 2.4L7 11.6 5 13l.5-2.4-2-1.8 2.5-.9.7-2z" fill="currentColor" stroke="none" transform="translate(1.2 0) scale(.8)"/><path d="M17 14l.7 2 .8 2.2L21 18.7l-2 1.8.5 2.4-2.3-1.4-2 1.4.5-2.4-2-1.8 2.5-.9.7-2z" fill="currentColor" stroke="none"/><path d="M9 9l6 5" opacity=".5"/>',
  // 成就（勋章星）
  award: '<circle cx="12" cy="9" r="5"/><path d="M9 13l-1.8 6.5L12 17l4.8 2.5L15 13"/><path d="M12 6.6l.7 1.6 1.7.1-1.3 1.2.5 1.7L12 10.2l-1.6.9.5-1.7-1.3-1.2 1.7-.1z" fill="currentColor" stroke="none"/>',
  // 节气（日轮）
  solar: '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>',
  // 星图（星点连线）
  chart: '<circle cx="5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="4" r="1.3" fill="currentColor" stroke="none"/><circle cx="18" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="17" cy="17" r="1.3" fill="currentColor" stroke="none"/><path d="M5 6l7-2 6 5-9 7 8 1" stroke-width="1.1"/>',
  // 四芒星（星野 / 通用）
  star: '<path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill="currentColor" stroke="none"/>',
  // 搜索
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  // 消息
  msg: '<rect x="4" y="6.5" width="16" height="11.5" rx="2.5"/><path d="M5.5 9l6.5 4.5L18.5 9"/>',
  // 笔记
  note: '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/><path d="M9.5 12h6M9.5 15h6"/>',
  // 旅程
  journey: '<circle cx="5" cy="18" r="2" fill="currentColor" stroke="none"/><path d="M5 18c4 0 6-8 15-8"/><path d="M16 6l3.2 1-1 3.2z" fill="currentColor" stroke="none"/>',
  // 心灯
  heart: '<path d="M12 20S5 15.5 5 9.8A3.6 3.6 0 0 1 12 8.3a3.6 3.6 0 0 1 7 1.5C19 15.5 12 20 12 20z"/><path d="M12 11c.6.9 1.6 1.1 1.6 2.1A1.6 1.6 0 0 1 12 14.6a1.6 1.6 0 0 1-1.6-1.5C10.4 12.1 11.4 11.9 12 11z" fill="currentColor" stroke="none"/>',
  // 静心（同心圆）
  calm: '<circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="12" r="6.5" stroke-width="1.3"/><path d="M12 3.5v2" opacity=".7"/>',
  // 祈福（铃）
  blessing: '<path d="M12 4v8.5"/><path d="M8 9.5a4 4 0 0 1 8 0c0 4 1.5 5 2 5.5H6c.5-.5 2-1.5 2-5.5z"/><path d="M6 19h12"/><path d="M10 19v2h4v-2"/>',
  // 文旅（定位针）
  tourism: '<path d="M12 21s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.4 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'
};

Component({
  properties: {
    name: { type: String, value: '' },
    size: { type: Number, value: 24 },
    theme: { type: String, value: 'light' }
  },
  data: { src: '' },
  lifetimes: {
    attached() { this.render(); }
  },
  observers: {
    'name,theme,size': function () { this.render(); }
  },
  methods: {
    render() {
      const svg = ICONS[this.data.name];
      if (!svg) { this.setData({ src: '' }); return; }
      const c = COLORS[this.data.theme] || COLORS.light;
      const s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + c + '" color="' + c + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + svg + '</svg>';
      this.setData({ src: 'data:image/svg+xml,' + encodeURIComponent(s) });
    }
  }
});
