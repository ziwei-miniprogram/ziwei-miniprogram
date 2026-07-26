// MVP 演示数据。实际项目请由后端 / 云开发数据库提供。
const palaza = {
  name: "示例星图",
  birth: "1990-05-20 14:30",
  gender: "女",
  mingJu: "紫微在午",
  mainStars: ["紫微", "天府", "武曲", "贪狼", "廉贞", "破军"],
  palaces: [
    { name: "命宫", star: "紫微", desc: "领导气质，稳重有担当" },
    { name: "兄弟", star: "天机", desc: "手足缘淡，各自独立" },
    { name: "夫妻", star: "太阳", desc: "配偶外向，宜晚婚" },
    { name: "子女", star: "武曲", desc: "子女个性强，管教需耐心" },
    { name: "财帛", star: "天同", desc: "财运平稳，不宜投机" },
    { name: "疾厄", star: "廉贞", desc: "注意心血管与情绪" },
    { name: "迁移", star: "天府", desc: "外出得助，宜远行发展" },
    { name: "交友", star: "太阴", desc: "朋友温和，贵人在暗" },
    { name: "事业", star: "贪狼", desc: "多才多艺，宜跨界" },
    { name: "田宅", star: "巨门", desc: "房产运一般，宜居安静" },
    { name: "福德", star: "天相", desc: "内心平和，晚运佳" },
    { name: "父母", star: "天梁", desc: "长辈缘佳，得庇佑" }
  ]
};

const products = [
  { id: 1, title: "紫微星象主题·天然紫水晶簇", price: 168, tag: "水晶", meritTag: "功德Lv.3 享9折", sales: "月销 320", cover: "💎", badge: "星图同款", bg: "linear-gradient(140deg,#6a8fc0,#9bb8e0)" },
  { id: 2, title: "寄愿·暖月香薰蜡烛 静心", price: 89, tag: "香薰", meritTag: "功德 +1/单", sales: "月销 540", cover: "🕯️", badge: "", bg: "linear-gradient(140deg,#c8a35a,#e0c489)" },
  { id: 3, title: "108 颗星辉檀木念珠", price: 128, tag: "文创", meritTag: "功德Lv.2 享95折", sales: "月销 210", cover: "📿", badge: "", bg: "linear-gradient(140deg,#7fb7a3,#a9d4c5)" },
  { id: 4, title: "十二宫游学·敦煌星图 3 日", price: 1980, tag: "线路", meritTag: "赠寄愿灯", sales: "已报名 86", cover: "🏔️", badge: "星图同款", bg: "linear-gradient(140deg,#3a3660,#6a5f96)" },
  { id: 5, title: "《紫微星象文化入门》签名版", price: 59, tag: "书籍", meritTag: "功德 +1/单", sales: "月销 430", cover: "📖", badge: "", bg: "linear-gradient(140deg,#b9544a,#e0796f)" },
  { id: 6, title: "睡前冥想引导卡牌 21 天", price: 79, tag: "课程", meritTag: "功德Lv.1 享9折", sales: "月销 360", cover: "🌙", badge: "", bg: "linear-gradient(140deg,#3b3a5c,#5b5a82)" }
];

const tours = [
  { id: 1, title: "青城山·道家养生研学", days: 3, price: 1299, cover: "⛰", desc: "太极+紫微文化+禅茶" },
  { id: 2, title: "普陀山·寄愿静心之旅", days: 2, price: 999, cover: "🛶", desc: "观音道场+正念抄经" },
  { id: 3, title: "终南山·隐修体验营", days: 5, price: 2599, cover: "🌿", desc: "闭关+疗愈工作坊" }
];

const healings = [
  { id: 1, title: "睡前放松冥想 10 分钟", type: "音频", cover: "🌙" },
  { id: 2, title: "焦虑舒缓·呼吸训练", type: "课程", cover: "🍃" },
  { id: 3, title: "预约疗愈师 1v1 咨询", type: "咨询", cover: "🤝" }
];

// 功德林：演示榜单（昵称 + 累计功德 + 等级）。排名仅娱乐展示，可匿名。
const meritBoard = [
  { rank: 1, name: "云隐山人", merit: 2480, level: "大德", region: "杭州", crown: true },
  { rank: 2, name: "晚照", merit: 1960, level: "行者", region: "成都" },
  { rank: 3, name: "一叶舟", merit: 1520, level: "行者", region: "苏州" },
  { rank: 4, name: "听风", merit: 980, level: "修士", region: "广州" },
  { rank: 5, name: "拾光的人", merit: 760, level: "修士", region: "上海" },
  { rank: 6, name: "南山", merit: 520, level: "居士", region: "西安" },
  { rank: 7, name: "阿照", merit: 430, level: "居士", region: "北京" },
  { rank: 8, name: "清欢", merit: 280, level: "居士", region: "厦门" },
  { rank: 9, name: "小满", merit: 160, level: "清信士", region: "武汉" },
  { rank: 10, name: "你", merit: 0, level: "善信", region: "我的城市", me: true }
];

// 共修团：成员每日打卡，团进度满解锁集体成就。
const meritGroups = [
  { id: 1, name: "21 天早睡共修", members: 1280, checked: 1092, goal: 21, myJoined: true, reward: "限定·月白莲灯皮肤" },
  { id: 2, name: "普陀山线上朝圣", members: 642, checked: 530, goal: 7, myJoined: false, reward: "专属寄愿视频模板" },
  { id: 3, name: "每日一善·抄经", members: 3510, checked: 3300, goal: 30, myJoined: false, reward: "功德证书·金边" }
];

// 寄愿墙：他人心愿，可「添灯」（布施少量功德代其点亮）。
const wishWall = [
  { id: 1, name: "匿名善信", wish: "愿家人平安，母亲手术顺利。", lamps: 36 },
  { id: 2, name: "晚风", wish: "愿考研上岸，不负这一年。", lamps: 21 },
  { id: 3, name: "阿桥", wish: "愿漂泊的人都能有归处。", lamps: 58 },
  { id: 4, name: "小星", wish: "愿世界和平，少一点离别。", lamps: 12 }
];

// 我的结缘（有缘人）：每日可「随喜」+1，形成羁绊。
const myBonds = [
  { id: 1, name: "云隐山人", bond: "同修·星图", todayGiven: false },
  { id: 2, name: "一叶舟", bond: "共修·抄经", todayGiven: false },
  { id: 3, name: "晚照", bond: "结缘·寄愿", todayGiven: false }
];

// ===== 小红书式内容流 =====
// 发现流瀑布：每条笔记可点进 note 详情。
const feed = [
  { id: 1, emoji: "🌌", bg: "linear-gradient(140deg,#2b2b4e,#4a4a7a)", title: "在苍山脚下看银河，那一刻我懂了「命宫」", author: "野山星野", likes: "1.2w", topic: "星图", h: 230, noteId: 101 },
  { id: 2, emoji: "🔮", bg: "linear-gradient(140deg,#3a3660,#6a5f96)", title: "我的紫微星图：事业宫太阳旺，但迁移宫…", author: "星图笔记", likes: "3621", topic: "星图", h: 200, noteId: 102 },
  { id: 3, emoji: "🍃", bg: "linear-gradient(140deg,#7fb7a3,#a9d4c5)", title: "焦虑时我会做的 4-7-8 呼吸法，亲测有效", author: "疗愈所", likes: "8033", topic: "疗愈", h: 250, noteId: 103 },
  { id: 4, emoji: "🏮", bg: "linear-gradient(140deg,#b9544a,#e0796f)", title: "普陀山寄愿墙，为妈妈点了一盏灯", author: "寄愿", likes: "5210", topic: "寄愿", h: 210, noteId: 104 },
  { id: 5, emoji: "🏜️", bg: "linear-gradient(140deg,#c8a35a,#e0c489)", title: "十二宫游学·第③站 敦煌星图与壁画", author: "文旅", likes: "2880", topic: "文旅", h: 240, noteId: 105 },
  { id: 6, emoji: "🌙", bg: "linear-gradient(140deg,#3b3a5c,#5b5a82)", title: "睡前冥想 10 分钟，这周终于睡好了", author: "疗愈所", likes: "6742", topic: "疗愈", h: 190, noteId: 103 },
  { id: 7, emoji: "🏆", bg: "linear-gradient(140deg,#c8a35a,#b8945a)", title: "功德林周榜第一的姐妹，每天做了什么？", author: "功德林", likes: "9910", topic: "功德", h: 220, noteId: 106 },
  { id: 8, emoji: "♌", bg: "linear-gradient(140deg,#d99a4e,#e8b96b)", title: "狮子座本周状态：宜专注，忌内耗", author: "星座", likes: "4155", topic: "星座", h: 200, noteId: 107 },
  { id: 9, emoji: "🌿", bg: "linear-gradient(140deg,#7fb7a3,#bfe0d2)", title: "终南山闭关 5 天，我把手机戒了", author: "文旅", likes: "3320", topic: "文旅", h: 230, noteId: 108 },
  { id: 10, emoji: "🪔", bg: "linear-gradient(140deg,#b9544a,#f0a89c)", title: "给陌生人的一盏灯：匿名善意的循环", author: "寄愿", likes: "7180", topic: "寄愿", h: 210, noteId: 104 }
];

// 笔记详情（按 id 取）
const notes = {
  101: { id: 101, title: "在苍山脚下看银河，那一刻我懂了「命宫」", emoji: "🌌", bg: "linear-gradient(140deg,#2b2b4e,#4a4a7a)",
    body: "一直觉得星图是「算命」，直到这趟旅行。向导说：「你命宫在寅，喜动中求静。」我在山顶躺了半小时，看银河斜过苍山——原来所谓命宫，是提醒我该去哪里安放自己。#星图旅行 #苍山 #心灵之旅",
    author: { name: "野山星野", avatar: "野" }, likes: "1.2w", collects: "8621", topic: "星图" },
  102: { id: 102, title: "我的紫微星图：事业宫太阳旺，但迁移宫…", emoji: "🔮", bg: "linear-gradient(140deg,#3a3660,#6a5f96)",
    body: "排完星图发现事业宫太阳旺，适合被看见；但迁移宫有煞，远行容易纠结。师傅说：「先把眼前事做透，远方自会来。」#紫微星象 #事业 #自我探索",
    author: { name: "星图笔记", avatar: "星" }, likes: "3621", collects: "2103", topic: "星图" },
  103: { id: 103, title: "焦虑时我会做的 4-7-8 呼吸法，亲测有效", emoji: "🍃", bg: "linear-gradient(140deg,#7fb7a3,#a9d4c5)",
    body: "吸气 4 秒、憋气 7 秒、呼气 8 秒，重复 4 轮。坚持两周，睡前不再刷手机到凌晨。分享给同样内耗的你。#疗愈 #呼吸法 #焦虑舒缓",
    author: { name: "疗愈所", avatar: "疗" }, likes: "8033", collects: "6210", topic: "疗愈" },
  104: { id: 104, title: "普陀山寄愿墙，为妈妈点了一盏灯", emoji: "🏮", bg: "linear-gradient(140deg,#b9544a,#e0796f)",
    body: "妈妈身体不好，我在寄愿墙写下一行字，又替墙上的陌生人添了几盏灯。善意流动的时候，自己也被照亮了。#寄愿 #普陀山 #亲情",
    author: { name: "寄愿", avatar: "愿" }, likes: "5210", collects: "3902", topic: "寄愿" },
  105: { id: 105, title: "十二宫游学·第③站 敦煌星图与壁画", emoji: "🏜️", bg: "linear-gradient(140deg,#c8a35a,#e0c489)",
    body: "在莫高窟看飞天，突然明白「迁移宫」画的就是走出去看世界。这趟把星图读活了。#文旅 #敦煌 #星图旅行",
    author: { name: "文旅", avatar: "旅" }, likes: "2880", collects: "1904", topic: "文旅" },
  106: { id: 106, title: "功德林周榜第一的姐妹，每天做了什么？", emoji: "🏆", bg: "linear-gradient(140deg,#c8a35a,#b8945a)",
    body: "采访了周榜第一：晨间签到、给 3 位有缘人随喜、睡前为寄愿墙添灯。她说功德不是数字，是「今天有没有对谁好一点」。#功德 #日行一善 #结缘",
    author: { name: "功德林", avatar: "德" }, likes: "9910", collects: "7201", topic: "功德" },
  107: { id: 107, title: "狮子座本周状态：宜专注，忌内耗", emoji: "♌", bg: "linear-gradient(140deg,#d99a4e,#e8b96b)",
    body: "火象本周能量在线，适合推进搁置项目；但别被别人的节奏带跑。今晚宜独处充电。#星座 #狮子座 #周运",
    author: { name: "星座", avatar: "星" }, likes: "4155", collects: "2890", topic: "星座" },
  108: { id: 108, title: "终南山闭关 5 天，我把手机戒了", emoji: "🌿", bg: "linear-gradient(140deg,#7fb7a3,#bfe0d2)",
    body: "没有信号的第 3 天，反而听见了风。回来后把每日一善写进日程。推荐给每个被信息淹没的人。#文旅 #闭关 #疗愈",
    author: { name: "文旅", avatar: "旅" }, likes: "3320", collects: "2408", topic: "文旅" }
};

// 消息中心
const messages = {
  sessions: [
    { id: 1, name: "云隐山人", avatar: "云", last: "明日共修记得打卡呀 🪔", time: "10:24", unread: 2 },
    { id: 2, name: "一叶舟", avatar: "叶", last: "寄愿视频模板发你啦", time: "昨天", unread: 0 },
    { id: 3, name: "晚照", avatar: "照", last: "结缘帖收到，已随喜 ✦", time: "周一", unread: 0 }
  ],
  notices: [
    { id: 1, type: "like", text: "野山星野 赞了你的笔记《在苍山看银河》", time: "12 分钟前" },
    { id: 2, type: "collect", text: "疗愈所 收藏了你的笔记", time: "1 小时前" },
    { id: 3, type: "follow", text: "小满 关注了你", time: "昨天" }
  ],
  meritFeed: [
    { id: 1, text: "你为「匿名善信」添了一盏灯 · +3 功德", time: "今天 08:30" },
    { id: 2, text: "晨间签到 · +3 功德", time: "今天 07:02" },
    { id: 3, text: "给 云隐山人 随喜 · +1 功德", time: "昨天 21:10" }
  ]
};

// 个人主页
const profileNotes = [
  { id: 101, emoji: "🌌", bg: "linear-gradient(140deg,#2b2b4e,#4a4a7a)", title: "苍山银河" },
  { id: 103, emoji: "🍃", bg: "linear-gradient(140deg,#7fb7a3,#a9d4c5)", title: "呼吸法" },
  { id: 105, emoji: "🏜️", bg: "linear-gradient(140deg,#c8a35a,#e0c489)", title: "敦煌" },
  { id: 102, emoji: "🔮", bg: "linear-gradient(140deg,#3a3660,#6a5f96)", title: "事业宫" },
  { id: 104, emoji: "🏮", bg: "linear-gradient(140deg,#b9544a,#e0796f)", title: "寄愿墙" },
  { id: 108, emoji: "🌙", bg: "linear-gradient(140deg,#3b3a5c,#5b5a82)", title: "闭关" }
];
const personality = {
  title: "星图探索者",
  desc: "命宫紫微坐守，天生带着好奇心；你不是来「算」命运的，是来「走」命运的。",
  traits: ["好奇", "稳健", "善结缘", "宜远行"]
};
const cityLights = ["杭州", "大理", "敦煌", "普陀山", "成都"];

// ===== 发现流 · 关注分屏 =====
// 已关注的人（个人主页入口）
const following = [
  { id: 1, name: "野山星野", avatar: "野", bio: "星图旅行家 · 大理", fans: "3.2w" },
  { id: 2, name: "疗愈所", avatar: "疗", bio: "睡前冥想引导", fans: "8.0w" },
  { id: 3, name: "寄愿", avatar: "愿", bio: "普陀山寄愿墙", fans: "1.5w" },
  { id: 4, name: "文旅", avatar: "旅", bio: "十二宫游学领队", fans: "2.7w" }
];
// 关注的人的笔记流（首条为其最新动态）
const followingFeed = [
  { id: 21, emoji: "🌌", bg: "linear-gradient(140deg,#2b2b4e,#4a4a7a)", title: "今天的银河很亮，命宫在寅的人宜动中求静", author: "野山星野", likes: "3201", topic: "星图", h: 230, noteId: 101 },
  { id: 22, emoji: "🍃", bg: "linear-gradient(140deg,#7fb7a3,#a9d4c5)", title: "今晚的冥想引导更新了，焦虑时来听", author: "疗愈所", likes: "5620", topic: "疗愈", h: 200, noteId: 103 },
  { id: 23, emoji: "🏮", bg: "linear-gradient(140deg,#b9544a,#e0796f)", title: "寄愿墙今晚很暖，替陌生人也点一盏", author: "寄愿", likes: "4180", topic: "寄愿", h: 210, noteId: 104 },
  { id: 24, emoji: "🏜️", bg: "linear-gradient(140deg,#c8a35a,#e0c489)", title: "敦煌站报名过半，星图同好速来", author: "文旅", likes: "2390", topic: "文旅", h: 240, noteId: 105 },
  { id: 25, emoji: "🌙", bg: "linear-gradient(140deg,#3b3a5c,#5b5a82)", title: "睡前 10 分钟，这周终于睡好了", author: "疗愈所", likes: "6742", topic: "疗愈", h: 190, noteId: 103 }
];

// ===== 发现流 · 视频分屏 =====
const videos = [
  { id: 1, cover: "🌌", bg: "linear-gradient(140deg,#2b2b4e,#4a4a7a)", title: "10 分钟睡前冥想引导｜焦虑舒缓", author: "疗愈所", dur: "10:24", plays: "8.2w", topic: "疗愈" },
  { id: 2, cover: "🏮", bg: "linear-gradient(140deg,#b9544a,#e0796f)", title: "普陀山寄愿 · 一步一灯", author: "寄愿", dur: "03:48", plays: "2.1w", topic: "寄愿" },
  { id: 3, cover: "🌠", bg: "linear-gradient(140deg,#3a3660,#6a5f96)", title: "苍山银河延时 · 命宫与远方", author: "野山星野", dur: "01:12", plays: "12w", topic: "星图" },
  { id: 4, cover: "🏜️", bg: "linear-gradient(140deg,#c8a35a,#e0c489)", title: "敦煌星图漫游 Vlog", author: "文旅", dur: "06:30", plays: "4.5w", topic: "文旅" },
  { id: 5, cover: "🪔", bg: "linear-gradient(140deg,#b9544a,#f0a89c)", title: "给陌生人的一盏灯：善意循环", author: "寄愿", dur: "02:05", plays: "7.1w", topic: "寄愿" },
  { id: 6, cover: "♌", bg: "linear-gradient(140deg,#d99a4e,#e8b96b)", title: "狮子座本周状态｜宜专注忌内耗", author: "星座", dur: "04:33", plays: "5.6w", topic: "星座" }
];

module.exports = {
  palaza, products, tours, healings, meritBoard, meritGroups, wishWall, myBonds,
  feed, notes, messages, profileNotes, personality, cityLights,
  following, followingFeed, videos
};
