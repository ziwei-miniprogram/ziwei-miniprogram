// 本地内容安全预检（演示版 / 分级）。
// 真实生产环境应调用微信内容安全 API（msgSecCheck / imgSecCheck）或服务端审核。
// 关键词来自《内容合规与命名手册》，按风险类别分组：迷信改运承诺、医疗绝对化承诺、
// 金钱收益诱导、违法违规与站外导流。
// check(text) 返回 { ok, hits:[{word,category,tip}] }；advice(hits) 生成友好修改建议。

const CATEGORIES = [
  {
    key: 'superstition',
    label: '迷信改运承诺',
    tip: '星象 / 抽签 / 卡牌内容仅作传统文化与心理慰藉的娱乐参考，避免承诺改运、消灾、转运等效果。',
    words: [
      '算命', '改命', '改运', '转运', '消灾', '破灾', '法事', '超度', '驱邪', '通灵', '附体',
      '鬼上身', '阴婚', '祖先显灵', '看相算命', '风水改运', '大师改运', '逆天改命', '改命数'
    ]
  },
  {
    key: 'medical',
    label: '医疗绝对化承诺',
    tip: '不做治疗、治愈、包治等承诺；身心不适请寻求专业医疗帮助。',
    words: [
      '血光', '必死', '绝症', '治百病', '包治', '偏方治癌', '秘方治癌', '迷信治',
      '包你治好', '一贴灵', '根治', ' guaranteed 治愈', '药到病除'
    ]
  },
  {
    key: 'money',
    label: '金钱收益诱导',
    tip: '避免稳赚、躺赚、博彩等收益诱导表述，功德与金钱无关、不可交易。',
    words: [
      '稳赚', '带赚', '保赚', '投资稳赚', '加微信发财', '日入过万', '躺赚', '被动收入稳赚',
      '私彩', '地下六合彩', '博彩', '赌博', '稳赚不赔', '带你赚钱'
    ]
  },
  {
    key: 'illicit',
    label: '违法违规 / 站外导流',
    tip: '避免办证、代开发票、色情及「加微信 / 加群」等站外导流表述。',
    words: [
      '办证', '代开发票', '迷药', '色情', '约炮', '代孕', '重金求子',
      '加微信', '加我微信', '微信号', 'V信', '加V', '扫二维码私聊', '私聊有惊喜', '加群领'
    ]
  }
];

// 检查文本。返回 { ok, hits }
function check(text) {
  if (!text || typeof text !== 'string') return { ok: true, hits: [] };
  const hits = [];
  for (const cat of CATEGORIES) {
    for (const w of cat.words) {
      if (text.indexOf(w) !== -1) hits.push({ word: w, category: cat.label, tip: cat.tip });
    }
  }
  return { ok: hits.length === 0, hits };
}

// 由命中项生成友好建议（按类别去重，最多 3 条）
function advice(hits) {
  if (!hits || !hits.length) return '';
  const seen = {};
  const lines = [];
  for (const h of hits) {
    if (seen[h.category]) continue;
    seen[h.category] = true;
    lines.push(`· ${h.category}：${h.tip}`);
    if (lines.length >= 3) break;
  }
  const words = [...new Set(hits.map(h => h.word))].slice(0, 6).join('、');
  return `涉及：${words}\n${lines.join('\n')}`;
}

module.exports = { check, advice, CATEGORIES };
