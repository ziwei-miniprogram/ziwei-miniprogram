const { notes } = require('../../utils/mock.js');
const social = require('../../utils/social.js');
const { check, advice } = require('../../utils/censor.js');

function loadMine(id) {
  try {
    const arr = wx.getStorageSync('my_publishes');
    if (Array.isArray(arr)) {
      const m = arr.find(n => n.id === id);
      if (m) {
        return {
          id: m.id, title: m.title, icon: m.icon || 'note', bg: m.bg, body: m.body || '',
          author: { name: m.author, avatar: (m.author || '拾')[0] },
          likes: m.likes, collects: m.collects, topic: m.topic
        };
      }
    }
  } catch (e) {}
  return null;
}

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    note: null,
    liked: false,
    collected: false,
    likeNum: '0',
    collectNum: '0',
    related: [],
    comments: [],
    commentText: '',
    showComment: false,
    theme: 'light'
  },
  onShow() {
  },
  onLoad(opts) {
    const id = Number(opts.id) || 101;
    let note = notes[id] || loadMine(id) || notes[101];
    const rel = Object.values(notes)
      .filter(n => n.id !== id && n.topic === note.topic)
      .slice(0, 4);
    const liked = social.isLiked(id);
    const collected = social.isCollected(id);
    let comments = [];
    try { comments = wx.getStorageSync('note_comments_' + note.id) || []; } catch (e) {}
    if (!Array.isArray(comments)) comments = [];
    this.setData({
      note,
      related: rel.length ? rel : Object.values(notes).slice(0, 4),
      liked, collected,
      likeNum: social.countStr(note.likes, liked ? 1 : 0),
      collectNum: social.countStr(note.collects, collected ? 1 : 0),
      comments
    });
  },
  // —— UGC 随手记评论：内容安全预检门禁（照 publish 页同款模式）——
  openComment() { this.setData({ showComment: true }); },
  onComment(e) { this.setData({ commentText: e.detail.value }); },
  closeComment() { this.setData({ showComment: false, commentText: '' }); },
  sendComment() {
    const text = (this.data.commentText || '').trim();
    if (!text) { wx.showToast({ title: '写点什么再留足迹~', icon: 'none' }); return; }
    // 内容安全预检（本地演示版；生产应接微信内容安全 API）
    const c = check(text);
    if (!c.ok) {
      wx.showModal({
        title: '内容需调整',
        content: '检测到以下内容需修改，保持传统文化与友善分享：\n\n' + advice(c.hits),
        showCancel: false
      });
      return;
    }
    const item = { id: Date.now(), text, t: '刚刚' };
    const key = 'note_comments_' + this.data.note.id;
    let arr = [];
    try { arr = wx.getStorageSync(key); } catch (e) {}
    if (!Array.isArray(arr)) arr = [];
    arr.unshift(item);
    try { wx.setStorageSync(key, arr); } catch (e) {}
    const app = getApp();
    app.addMerit(1, '留足迹');
    this.setData({ comments: arr, commentText: '', showComment: false });
    wx.showToast({ title: '留下足迹 · +1 功德', icon: 'none' });
  },
  // 点赞 / 收藏联动功德并持久化（与首页状态一致），计数实时增减
  toggleLike() {
    const r = social.toggleLike(this.data.note.id);
    this.setData({ liked: r.active, likeNum: social.countStr(this.data.note.likes, r.active ? 1 : 0) });
    wx.showToast({ title: r.active ? '已赞 · +1 功德' : '已取消点赞', icon: 'none' });
  },
  toggleCollect() {
    const r = social.toggleCollect(this.data.note.id);
    this.setData({ collected: r.active, collectNum: social.countStr(this.data.note.collects, r.active ? 1 : 0) });
    wx.showToast({ title: r.active ? '已收藏 · +1 功德' : '已取消收藏', icon: 'none' });
  },
  addLamp() {
    const app = getApp();
    app.addMerit(1, '添灯');
    wx.showToast({ title: '添灯 · +1 功德', icon: 'none' });
  },
  openNote(e) { wx.navigateTo({ url: '/pages/note/note?id=' + e.currentTarget.dataset.id }); }
});
