// 星野 · 工具箱：全部工具型页面的唯一归口（接回孤儿页 journey / blessing）
const { toolIcon } = require('../../utils/icons.js');

const TOOLS = [
  { key: 'chart', name: '星图', desc: '深度星象解读', url: '/pages/chart/chart' },
  { key: 'healing', name: '疗愈', desc: '呼吸与冥想', url: '/pages/healing/healing' },
  { key: 'journey', name: '心灵之旅', desc: '正念行走', url: '/pages/journey/journey' },
  { key: 'wish', name: '寄愿墙', desc: '心愿与灯', url: '/pages/merit/merit?tab=wish' },
  { key: 'blessing', name: '祝福视频', desc: '星夜祝福', url: '/pages/blessing/blessing' },
  { key: 'merit', name: '功德林', desc: '日行一善', url: '/pages/merit/merit' },
  { key: 'ziwei', name: '紫微斗数', desc: '命宫主星', url: '/pages/ziwei/ziwei' },
  { key: 'bazi', name: '八字命理', desc: '五行排盘', url: '/pages/bazi/bazi' },
  { key: 'xingzuo', name: '星座测试', desc: '今日运势', url: '/pages/xingzuo/xingzuo' }
];

function withIcons(list, theme) {
  return list.map((t) => Object.assign({}, t, { icon: toolIcon(t.key, theme) }));
}

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: { tools: [], theme: 'light' },
  onShow() {
    const app = getApp();
    const theme = app.getTheme();
    this.setData({ tools: withIcons(TOOLS, theme) });
  },
  go(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url });
  },
  onShareAppMessage() {
    return { title: '星野工具箱 · 星图疗愈寄愿', path: '/pages/index/index' };
  }
});
