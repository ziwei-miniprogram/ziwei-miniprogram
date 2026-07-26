// 社交互动状态层：点赞 / 收藏 / 关注。
// 本地持久化 + 与功德系统联动（首次互动各 +1 功德）+ 写入「活」功德动态日志。
// 取消点赞/收藏/关注不会扣功德，避免反复刷分。
// 每条动态带 route，供消息中心溯源跳回来源页。

const SOCIAL_KEY = 'social_state';
const LOG_KEY = 'merit_log';

function getAppSafe() {
  try { return getApp(); } catch (e) { return null; }
}

function loadSocial() {
  try {
    const s = wx.getStorageSync(SOCIAL_KEY);
    if (s && typeof s === 'object') return s;
  } catch (e) {}
  return { liked: {}, collected: {}, followed: {} };
}
function saveSocial(s) {
  try { wx.setStorageSync(SOCIAL_KEY, s); } catch (e) {}
}

function loadLog() {
  try {
    const s = wx.getStorageSync(LOG_KEY);
    if (Array.isArray(s)) return s;
  } catch (e) {}
  return [];
}
function saveLog(arr) {
  try { wx.setStorageSync(LOG_KEY, arr); } catch (e) {}
}

function nowLabel() {
  const t = new Date();
  return `今天 ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
}

// 追加一条功德动态（最新在前，最多保留 60 条，暴露前 20 条）。
// route：来源页路径，供消息中心溯源跳回。
function pushLog(text, route) {
  const arr = loadLog();
  arr.unshift({ id: Date.now(), text, time: nowLabel(), route: route || '' });
  if (arr.length > 60) arr.length = 60;
  saveLog(arr);
  const app = getAppSafe();
  if (app && app.globalData) {
    app.globalData.meritLog = arr.slice(0, 20);
    if (typeof app.bumpUnread === 'function') app.bumpUnread(1);
  }
  return arr[0];
}

// 切换点赞。ref 用笔记 noteId（字符串）。返回 {active, delta}
function toggleLike(ref) {
  const key = String(ref);
  const s = loadSocial();
  const was = !!s.liked[key];
  let delta = 0;
  if (was) {
    delete s.liked[key];
  } else {
    s.liked[key] = true;
    const app = getAppSafe();
    if (app) app.addMerit(1, '点赞');
    pushLog('点赞一条笔记 · +1 功德', '/pages/index/index');
    delta = 1;
  }
  saveSocial(s);
  return { active: !was, delta };
}

function toggleCollect(ref) {
  const key = String(ref);
  const s = loadSocial();
  const was = !!s.collected[key];
  let delta = 0;
  if (was) {
    delete s.collected[key];
  } else {
    s.collected[key] = true;
    const app = getAppSafe();
    if (app) app.addMerit(1, '收藏');
    pushLog('收藏一条笔记 · +1 功德', '/pages/index/index');
    delta = 1;
  }
  saveSocial(s);
  return { active: !was, delta };
}

function toggleFollow(name) {
  const s = loadSocial();
  const was = !!s.followed[name];
  let delta = 0;
  if (was) {
    delete s.followed[name];
  } else {
    s.followed[name] = true;
    const app = getAppSafe();
    if (app) app.addMerit(1, '关注');
    pushLog(`关注了 ${name} · +1 功德`, '/pages/index/index');
    delta = 1;
  }
  saveSocial(s);
  return { active: !was, delta };
}

function isLiked(ref) { return !!loadSocial().liked[String(ref)]; }
function isCollected(ref) { return !!loadSocial().collected[String(ref)]; }
function isFollowed(name) { return !!loadSocial().followed[name]; }

function counts() {
  const s = loadSocial();
  return {
    likes: Object.keys(s.liked).length,
    collects: Object.keys(s.collected).length,
    follows: Object.keys(s.followed).length
  };
}

function getLog() { return loadLog().slice(0, 20); }

// 直接记一条功德动态（供发布/点灯/签到等场景调用），可带 route 溯源。
function log(text, route) { return pushLog(text, route); }

// 展示用数字串解析 + 叠加用户自身 delta。
// 支持 "1.2w" / "3621" / 数字；用户的赞/藏对自己 +1（取消 -1），大数四舍五入回 w。
function countStr(base, delta) {
  let n = 0;
  if (typeof base === 'number') n = base;
  else if (typeof base === 'string') {
    const s = base.trim();
    if (s.indexOf('w') !== -1 || s.indexOf('万') !== -1) n = Math.round(parseFloat(s) * 10000);
    else n = parseInt(s, 10) || 0;
  }
  n = Math.max(0, n + (delta || 0));
  if (n >= 10000) return (Math.round(n / 1000) / 10) + 'w';
  return String(n);
}

const DEFAULT_FOLLOWS = ['野山星野', '疗愈所', '寄愿'];
// P0-4 社交冷启动：首次进入预置默认关注（不打扰、可一键取消）
function ensureDefaultFollows() {
  const s = loadSocial();
  let changed = false;
  DEFAULT_FOLLOWS.forEach(function (n) {
    if (!s.followed[n]) { s.followed[n] = true; changed = true; }
  });
  if (changed) saveSocial(s);
  return changed;
}

module.exports = {
  toggleLike, toggleCollect, toggleFollow,
  isLiked, isCollected, isFollowed,
  counts, getLog, log, countStr,
  ensureDefaultFollows
};
