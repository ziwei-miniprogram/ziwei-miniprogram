// components/heritage-map — 非遗主题星图（闽南文化生态保护区）
// 复用 components/star-map 的视觉语言（四方分组 + 可点亮星点 + 点击出释义），
// 差别在于每颗星需要 3 枚碎片（行迹 / 善行 / 知见）才能点亮，星点下带碎片进度点。
// frags：形如 { nanyin: { trace: true, deed: true } }，由父页面从 utils/heritage-map 传入。
const hm = require('../../utils/heritage-map.js');

Component({
  properties: {
    frags: {
      type: Object,
      value: {},
      observer() { this.build(); }
    },
    theme: {
      type: String,
      value: 'light',
      observer(t) { this.setData({ theme: t || 'light' }); }
    }
  },

  data: {
    groups: [],
    kinds: hm.FRAGMENT_KINDS,
    lit: 0,
    total: hm.TOTAL,
    selected: null,
    theme: 'light'
  },

  lifetimes: {
    attached() {
      this.build();
      const app = getApp();
      if (app && app.getTheme) this.setData({ theme: app.getTheme() });
    }
  },

  pageLifetimes: {
    show() {
      const app = getApp();
      if (app && app.getTheme) this.setData({ theme: app.getTheme() });
    }
  },

  methods: {
    build() {
      const st = hm.computeState(this.data.frags || {});
      this.setData({
        groups: st.groups,
        lit: st.lit,
        total: st.total
      });
    },
    onTap(e) {
      const id = e.currentTarget.dataset.id;
      const node = hm.nodeById(id);
      if (!node) return;
      const st = hm.computeState(this.data.frags || {});
      const cur = st.nodes.filter(n => n.id === id)[0];
      this.setData({
        selected: {
          name: node.name,
          meta: node.city + ' · ' + node.level + ' · ' + node.cat,
          desc: node.desc,
          frags: cur.frags,
          count: cur.count,
          lit: cur.lit
        }
      });
    },
    closeCap() { this.setData({ selected: null }); }
  }
});
