// 搜索：过滤 feed + 已发布笔记（标题/作者），结果点进 note 详情。修复 B4 搜索死 UI。
const { feed } = require('../../utils/mock.js');

function getPublished() {
  try {
    const a = wx.getStorageSync('my_publishes');
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
}

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: { kw: '', results: [], theme: 'light' },
  onShow() {
  },
  onInput(e) {
    this.setData({ kw: e.detail.value });
    this.run();
  },
  run() {
    const kw = (this.data.kw || '').trim();
    if (!kw) { this.setData({ results: [] }); return; }
    const all = getPublished().concat(feed).map(it => ({
      id: it.id,
      title: it.title || it.body || '',
      author: it.author || '拾光的小野',
      icon: it.icon || 'star',
      bg: it.bg || 'linear-gradient(140deg,#2b2b4e,#4a4a7a)'
    }));
    const r = all.filter(it =>
      (it.title || '').indexOf(kw) >= 0 || (it.author || '').indexOf(kw) >= 0
    );
    this.setData({ results: r });
  },
  open(e) {
    wx.navigateTo({ url: '/pages/note/note?id=' + e.currentTarget.dataset.id });
  }
});
