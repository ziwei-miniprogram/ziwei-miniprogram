// 星野 · 工具箱：全部工具型页面的唯一归口（接回孤儿页 journey / blessing / note / publish）
// UX 架构 P0-a（解 B2 深井）：高频 3 项（星图/寄愿/三善）1 跳常驻 + 其余分 3 簇，压平深度。
// 图标唯一来源：components/icon/icon（astro）。此处只存图标名，由 wxml 渲染。

// 高频常驻（使用频次 Top3，1 跳直达，无需进入宫格）
const PINNED = [
  { key: 'chart', icon: 'chart', name: '星图', desc: '深度星象解读', url: '/pages/chart/chart' },
  { key: 'wish', icon: 'wish', name: '寄愿', desc: '心愿与灯', url: '/pages/merit/merit?tab=wish' },
  { key: 'merit', icon: 'deeds', name: '三善', desc: '日行一善', url: '/pages/merit/merit' }
];

// 其余按心智分 3 簇（2 跳：簇可见 → 进入）
const CLUSTERS = [
  { name: '识星', items: [
    { key: 'ziwei', icon: 'star', name: '紫微斗数', desc: '命宫主星', url: '/pages/star-panel/star-panel?mode=ziwei' },
    { key: 'bazi', icon: 'solar', name: '四柱八字', desc: '五行排盘', url: '/pages/star-panel/star-panel?mode=bazi' },
    { key: 'xingzuo', icon: 'chart', name: '星座测试', desc: '今日星语', url: '/pages/star-panel/star-panel?mode=xingzuo' }
  ] },
  { name: '安善', items: [
    { key: 'healing', icon: 'calm', name: '疗愈', desc: '呼吸与冥想', url: '/pages/healing/healing' },
    { key: 'journey', icon: 'journey', name: '心灵之旅', desc: '正念行走', url: '/pages/journey/journey' },
    { key: 'blessing', icon: 'blessing', name: '祝福卡', desc: '星夜祝福', url: '/pages/blessing/blessing' }
  ] },
  { name: '表达', items: [
    { key: 'publish', icon: 'share', name: '发布感悟', desc: '记一笔', url: '/pages/publish/publish' },
    { key: 'note', icon: 'note', name: '我的笔记', desc: '星夜随笔', url: '/pages/note/note' }
  ] }
];


Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: { pinned: [], clusters: [], theme: 'light' },
  onShow() {
    this.setData({ pinned: PINNED, clusters: CLUSTERS });
  },
  go(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url });
  },
  onShareAppMessage() {
    return { title: '星野工具箱 · 星图疗愈寄愿', path: '/pages/index/index' };
  }
});
