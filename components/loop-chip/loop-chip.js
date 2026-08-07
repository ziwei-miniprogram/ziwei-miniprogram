// components/loop-chip — 页底「下一步」芯片行（消除叶子页死胡同，解 B4）
// 用法：<loop-chip items="{{[{icon,label,url}]}}" title="接下来" theme="{{theme}}" />
// icon 传 astro 图标名（lamp/wish/deeds/chart/note/...），不再传 emoji。
// 点击直接 navigateTo，把用户送回主循环（复用 chart.js 已验证的「把墙变成长线」思路）。
Component({
  properties: {
    items: { type: Array, value: [] },   // [{ icon, label, url }]，icon = astro 名
    title: { type: String, value: '' },
    theme: { type: String, value: 'light' }
  },
  methods: {
    onTap(e) {
      const url = e.currentTarget.dataset.url;
      if (url) wx.navigateTo({ url: url });
    }
  }
});
