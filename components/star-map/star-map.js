// components/star-map — 二十八宿星图（游戏化收集 + 进度可视化）
// 四方各七宿：青龙(东)/玄武(北)/白虎(西)/朱雀(南)。
// lit：已点亮的宿数（0-28），由父页面按修行进度传入；glow：连签火苗（星图微光呼吸）。
const RAW = [
  { alias: '东方·青龙', stars: [
    ['角', '星辰初动 · 宜起念'], ['亢', '顺势而上'], ['氐', '根基渐稳'],
    ['房', '安居乐业'], ['心', '守心自照'], ['尾', '行稳致远'], ['箕', '随缘自在']
  ]},
  { alias: '北方·玄武', stars: [
    ['斗', '量度有方'], ['牛', '勤恳有功'], ['女', '巧思生慧'],
    ['虚', '守静蓄力'], ['危', '谨慎渡险'], ['室', '安顿身心'], ['壁', '隔绝纷扰']
  ]},
  { alias: '西方·白虎', stars: [
    ['奎', '文思泉涌'], ['娄', '聚气成事'], ['胃', '容纳百川'],
    ['昴', '星光簇拥'], ['毕', '周全细致'], ['觜', '明察秋毫'], ['参', '三才并立']
  ]},
  { alias: '南方·朱雀', stars: [
    ['井', '清泉润心'], ['鬼', '内省明察'], ['柳', '柔韧生长'],
    ['星', '点亮微光'], ['张', '张弛有度'], ['翼', '展翅轻盈'], ['轸', '回旋疗愈']
  ]}
];

Component({
  properties: {
    lit: { type: Number, value: 0 },
    glow: { type: Boolean, value: false },
    theme: {
      type: String,
      value: 'light',
      observer(t) { this.setData({ theme: t || 'light' }); }
    }
  },
  data: { groups: [], selected: '', cap: '', theme: 'light' },

  lifetimes: {
    attached() {
      this.build();
      const app = getApp();
      if (app && app.getTheme) this.setData({ theme: app.getTheme() });
    }
  },
  observers: {
    'lit': function () { this.build(); }
  },
  pageLifetimes: {
    show() {
      const app = getApp();
      if (app && app.getTheme) this.setData({ theme: app.getTheme() });
    }
  },

  methods: {
    build() {
      let idx = 0;
      const lit = Math.max(0, Math.min(28, this.data.lit || 0));
      const groups = RAW.map(g => {
        const stars = g.stars.map(s => {
          const on = idx < lit;
          idx++;
          return { name: s[0], meaning: s[1], on };
        });
        return { alias: g.alias, stars };
      });
      this.setData({ groups });
    },
    onTap(e) {
      const name = e.currentTarget.dataset.name;
      const meaning = e.currentTarget.dataset.meaning;
      this.setData({ selected: name, cap: `${name}宿 · ${meaning}` });
    }
  }
});
