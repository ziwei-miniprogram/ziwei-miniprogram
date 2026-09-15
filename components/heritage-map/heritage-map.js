// components/heritage-map — 非遗主题星图（闽南文化生态保护区）
// 复用 components/star-map 的视觉语言（四方分组 + 可点亮星点 + 点击出释义），
// 差别在于每颗星需要 3 枚碎片（行迹 / 善行 / 知见）才能点亮，星点下带碎片进度点。
//
// frags：形如 { nanyin: { trace: true, deed: true } }，由父页面从 utils/heritage-map 传入。
// 组件内可完成的两件事（另两条线由父页面驱动）：
//   · 立愿星：把某颗星设为「愿星」，此后每日三善的善行碎片优先发给它；
//   · 答题得「知见」：答对该星的文化小问即得碎片，答错可重答。
// 任一片片变动都 triggerEvent('change') 通知父页面重算 frags。
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
    pledge: null,
    pledgeName: '',
    theme: 'light',
    // 答题交互位
    quiz: null,
    wrongPick: -1,
    justRight: false
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
        total: st.total,
        pledge: hm.pledgeOf()
      });
    },

    // 刷新已展开的释义卡（答题 / 立愿后调用，不必重开卡片）
    refreshCap() {
      const sel = this.data.selected;
      if (!sel) return;
      const st = hm.computeState(this.data.frags || {});
      const cur = st.nodes.filter(n => n.id === sel.id)[0];
      if (!cur) return;
      this.setData({ selected: this.capOf(cur), pledge: hm.pledgeOf() });
    },

    capOf(cur) {
      const node = hm.nodeById(cur.id);
      return {
        id: cur.id,
        name: node.name,
        meta: node.city + ' · ' + node.level + ' · ' + node.cat,
        desc: node.desc,
        frags: cur.frags,
        count: cur.count,
        lit: cur.lit
      };
    },

    onTap(e) {
      const id = e.currentTarget.dataset.id;
      const st = hm.computeState(this.data.frags || {});
      const cur = st.nodes.filter(n => n.id === id)[0];
      if (!cur) return;
      this.setData({
        selected: this.capOf(cur),
        quiz: cur.frags.lore ? null : hm.quizOf(id),
        wrongPick: -1,
        justRight: false
      });
    },

    closeCap() { this.setData({ selected: null, quiz: null, wrongPick: -1, justRight: false }); },

    // 答题：答对得「知见」碎片，答错允许重答
    pickOpt(e) {
      const idx = Number(e.currentTarget.dataset.i);
      const sel = this.data.selected;
      if (!sel) return;
      const r = hm.answerQuiz(sel.id, idx);
      if (!r.ok && r.reason === 'wrong') {
        this.setData({ wrongPick: idx, justRight: false });
        return;
      }
      if (!r.ok) return;                        // dup 等，静默
      this.setData({ wrongPick: -1, justRight: true, quiz: null });
      this.triggerEvent('change', { reason: 'lore', result: r });
      this.refreshCap();
      if (r.mapComplete) {
        wx.showModal({
          title: '星图整体点亮',
          content: '二十颗星全部点亮。闽南这一片的戏、技、礼、衣，你都走过、做过、也答过了。',
          showCancel: false,
          confirmText: '知道了'
        });
      } else if (r.nodeLit) {
        wx.showToast({ title: '「' + r.node.name + '」点亮了', icon: 'none' });
      }
    },

    // 立愿星：此后每日三善的善行碎片优先发给它
    pledgeStar() {
      const sel = this.data.selected;
      if (!sel) return;
      const r = hm.setPledge(sel.id);
      if (!r.ok) return;
      this.setData({ pledge: sel.id });
      wx.showToast({ title: '已立愿 · ' + r.node.name, icon: 'none' });
      this.triggerEvent('change', { reason: 'pledge' });
    },

    // 行迹碎片缺位时，告诉用户具体去哪儿
    takeTrace() {
      const sel = this.data.selected;
      if (!sel) return;
      wx.showToast({ title: '去「' + hm.nodeById(sel.id).city + '」的线路站点打卡即可', icon: 'none' });
    }
  }
});
