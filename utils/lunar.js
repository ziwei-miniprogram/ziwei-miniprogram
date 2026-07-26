// utils/lunar.js —— 纯算法中国农历（1900–2099），无任何网络依赖。
// 用途：首页 Hero 与万年历动态驱动 —— 农历年月日、生肖、干支年月日、
//       二十四节气、建除十二神宜忌。算法基于经典农历数据表，可离线运行。

const lunarInfo = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
  0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
  0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
  0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
  0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
  0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
  0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252
];

const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ZODIAC = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const MONTH_CN = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
const DAY_CN = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
const SOLAR_TERM = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
const TERM_INFO = [0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758];

const JIANCHU = ['建','除','满','平','定','执','破','危','成','收','开','闭'];
const YIJI = [
  { s:'建', yi:'出行 祈福 动土 开市', ji:'安葬 乘船 词讼' },
  { s:'除', yi:'疗病 解除 出行 沐浴', ji:'求官 上任 嫁娶' },
  { s:'满', yi:'嫁娶 开市 交易 纳财', ji:'动土 安葬 破土' },
  { s:'平', yi:'修造 嫁娶 出行 安床', ji:'祈福 词讼 栽种' },
  { s:'定', yi:'嫁娶 造屋 入宅 纳采', ji:'词讼 出行 医治' },
  { s:'执', yi:'造屋 修造 收购 捕捉', ji:'开市 移居 出行' },
  { s:'破', yi:'破屋 求医 治病', ji:'嫁娶 出行 签约 动土' },
  { s:'危', yi:'安床 祭祀 祈福', ji:'登高 嫁娶 迁徙' },
  { s:'成', yi:'嫁娶 开市 入学 安床', ji:'词讼 争斗' },
  { s:'收', yi:'纳财 收购 入仓 捕捉', ji:'放债 出行 安葬' },
  { s:'开', yi:'开市 求医 祭祀 入学', ji:'安葬 嫁娶 动土' },
  { s:'闭', yi:'筑堤 补垣 安葬 埋穴', ji:'开市 出行 求医' }
];

function leapMonth(y){ return lunarInfo[y - 1900] & 0xf; }
function leapDays(y){ return leapMonth(y) ? ((lunarInfo[y - 1900] & 0x10000) ? 30 : 29) : 0; }
function monthDays(y, m){ return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29; }
function lYearDays(y){
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
  return sum + leapDays(y);
}
function daysBetween(y, m, d){
  const base = Date.UTC(1900, 0, 31);
  const cur = Date.UTC(y, m - 1, d);
  return Math.round((cur - base) / 86400000);
}

// 阳历 -> 农历
function toLunar(y, m, d){
  let offset = daysBetween(y, m, d);
  let ly = 1900, temp = 0;
  for (; ly < 2101 && offset > 0; ly++){ temp = lYearDays(ly); offset -= temp; }
  if (offset < 0){ offset += temp; ly--; }
  let isLeap = false;
  const leap = leapMonth(ly);
  let lm;
  for (lm = 1; lm < 13 && offset > 0; lm++){
    if (leap > 0 && lm === (leap + 1) && !isLeap){ lm--; isLeap = true; temp = leapDays(ly); }
    else { temp = monthDays(ly, lm); }
    if (isLeap && lm === (leap + 1)) isLeap = false;
    offset -= temp;
  }
  if (offset === 0 && leap > 0 && lm === leap + 1){
    if (isLeap){ isLeap = false; } else { isLeap = true; lm--; }
  }
  if (offset < 0){ offset += temp; lm--; }
  const ld = offset + 1;
  return { year: ly, month: lm, day: ld, isLeap };
}

// 节气判断：返回节气名或空串
function solarTermOf(y, m, d){
  for (let n = 2 * (m - 1); n <= 2 * (m - 1) + 1; n++){
    const off = new Date(31556925974.7 * (y - 1900) + TERM_INFO[n] * 60000 + Date.UTC(1900, 0, 6, 2, 5));
    if (off.getUTCDate() === d) return SOLAR_TERM[n];
  }
  return '';
}

// 日干支（1900-01-01 为甲戌）
function dayGanZhi(y, m, d){
  const diff = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 1)) / 86400000);
  const c = (diff + 10) % 60;
  return { g: GAN[c % 10], z: ZHI[c % 12], zi: c % 12 };
}

// 12 个「节」对应的地支月（用于建除推算）
const JIE = [
  { n:0,  m:1,  z:11 }, // 小寒 -> 丑
  { n:2,  m:2,  z:0  }, // 立春 -> 寅
  { n:4,  m:3,  z:1  }, // 惊蛰 -> 卯
  { n:6,  m:4,  z:2  }, // 清明 -> 辰
  { n:8,  m:5,  z:3  }, // 立夏 -> 巳
  { n:10, m:6,  z:4  }, // 芒种 -> 午
  { n:12, m:7,  z:5  }, // 小暑 -> 未
  { n:14, m:8,  z:6  }, // 立秋 -> 申
  { n:16, m:9,  z:7  }, // 白露 -> 酉
  { n:18, m:10, z:8  }, // 寒露 -> 戌
  { n:20, m:11, z:9  }, // 立冬 -> 亥
  { n:22, m:12, z:10 }  // 大雪 -> 子
];
function jieDateOf(y, j){
  const off = new Date(31556925974.7 * (y - 1900) + TERM_INFO[j.n] * 60000 + Date.UTC(1900, 0, 6, 2, 5));
  return { m: j.m, d: off.getUTCDate() };
}
function doyOf(y, m, d){
  const md = [0,31,28,31,30,31,30,31,31,30,31,30,31];
  let s = d; for (let i = 1; i < m; i++) s += md[i];
  if (m > 2 && ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0)) s++;
  return s;
}
function monthZhiOf(y, m, d){
  const target = doyOf(y, m, d);
  let chosen = JIE[0];
  for (const j of JIE){
    const p = jieDateOf(y, j);
    if (doyOf(y, p.m, p.d) <= target) chosen = j;
  }
  return chosen.z;
}

// 主入口：返回完整的农历信息对象
function getLunar(y, m, d){
  const L = toLunar(y, m, d);
  const yg = GAN[(L.year - 4) % 10];
  const yz = ZHI[(L.year - 4) % 12];
  const animal = ZODIAC[(L.year - 4) % 12];
  const monthCn = (L.isLeap ? '闰' : '') + MONTH_CN[L.month - 1] + '月';
  const dayCn = DAY_CN[L.day - 1];
  const term = solarTermOf(y, m, d);
  const dg = dayGanZhi(y, m, d);
  const mz = monthZhiOf(y, m, d);
  const jcIdx = (dg.zi - mz + 12) % 12;
  const jc = JIANCHU[jcIdx];
  const yj = YIJI[jcIdx];
  return {
    lunarYear: L.year, lunarMonth: L.month, lunarDay: L.day, isLeap: L.isLeap,
    yearGanZhi: yg + yz, animal,
    monthCn, dayCn,
    fullCn: yg + yz + '年 ' + monthCn + dayCn,
    term: term,                 // '' 或 节气名（如 大暑）
    dayGanZhi: dg.g + dg.z,     // 日干支（如 丁未）
    jianChu: jc,                // 建除十二神（如 成）
    yi: yj.yi,                  // 宜
    ji: yj.ji                   // 忌
  };
}

module.exports = { getLunar, toLunar };
