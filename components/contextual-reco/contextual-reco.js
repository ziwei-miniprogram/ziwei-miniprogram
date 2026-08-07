// components/contextual-reco — 峰值单件情境化结缘推荐（解 B5，L3/L4 转化）
// 用法：<contextual-reco icon="lamp" theme="light" tag="星礼结缘" name="..." desc="..." url="/pages/mall/mall" cta="去结缘" />
// 在情绪峰值（盲盒揭晓 / 星图点亮 / 文旅打卡）插入单件推荐，把用户送进结缘闭环，而非甩去商城 tab。
Component({
  properties: {
    icon: { type: String, value: 'lamp' },
    theme: { type: String, value: 'light' },
    tag: { type: String, value: '' },
    name: { type: String, value: '' },
    desc: { type: String, value: '' },
    url: { type: String, value: '' },
    cta: { type: String, value: '去结缘' }
  },
  methods: {
    go() {
      const url = this.data.url;
      if (url) {
        if (url.indexOf('/pages/') === 0 && url.indexOf('?') < 0 && this._isTab(url)) {
          wx.switchTab({ url: url });
        } else if (url.indexOf('/pages/') === 0) {
          wx.navigateTo({ url: url });
        } else {
          wx.navigateTo({ url: url });
        }
      }
    },
    _isTab(url) {
      // mall 是 tab，其余结缘页为 navigate
      return url === '/pages/mall/mall' || url === '/pages/index/index' ||
        url === '/pages/space/space' || url === '/pages/tourism/tourism' ||
        url === '/pages/profile/profile';
    }
  }
});
