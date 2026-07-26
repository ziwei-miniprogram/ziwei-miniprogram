// 线性 SVG 图标工具（data-uri，明暗自适应）
// 小程序 <image> 支持 data:image/svg+xml 形式；颜色随主题切换，避免 emoji 观感。
// 用法：
//   const { toolIcon } = require('../../utils/icons.js');
//   const uri = toolIcon('ziwei', 'light'); // 返回 data:image/svg+xml,...

const PATHS = {
  chart: 'M12 3l2.2 5.2L20 9.2l-4.4 4.2 1.1 6L12 16.9 7.3 19.6l1.1-6L4 9.2l5.8-1z',
  healing: 'M5 19c0-7 5-13 14-14-1 9-7 14-14 14z M5 19c2-4 5-7 9-9',
  journey: 'M3 13c2-3 4-3 6 0s4 3 6 0 4-3 6 0',
  wish: 'M9 3h6 M10 3v3 M14 3v3 M9 21h6 M10 21v-3 M14 21v-3 M8 6h8v12H8z M12 9v6',
  blessing: 'M8 5v14l11-7z M18 4l1.6 3.4L23 9l-3.4 1.6L18 14l-1.6-3.4L13 9l3.4-1.6z',
  merit: 'M12 3a6 6 0 0 0-6 6c0 3 2 4 2 6h8c0-2 2-3 2-6a6 6 0 0 0-6-6z M9 15h6 M12 15v5 M9 20h6',
  ziwei: 'M12 3l2.5 5.6L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.4z',
  bazi: 'M12 3a9 9 0 1 0 0 18c5 0 9-4 9-9a9 9 0 0 1-9-9z M12 6v6 M12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  xingzuo: 'M5 6l5 4 4-6 5 8 M5 6h0 M10 10h0 M14 4h0 M19 12h0 M7 18l4-3 M11 15l5 2'
};

// 内容叙事母题图标（星 / 灯 / 纸 / 夜 / 金线），描边用品牌金
const MOTIF_PATHS = {
  star: 'M12 3l2.5 5.6L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.4z',
  lamp: 'M12 3c3 4 5 6.5 5 9.5A5 5 0 0 1 7 12.5C7 9.5 9 7 12 3z M9 18h6 M10 21h4',
  paper: 'M6 3h9l4 4v14H6z M14 3v5h5 M9 13h7 M9 17h5',
  night: 'M16 4a8 8 0 1 0 0 16 6 6 0 0 1 0-16z',
  spark: 'M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z'
};

function iconDataUri(path, color) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
    'stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    path + '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// theme: 'light' | 'dark'，图标描边用对应前景色（保证对比度），非装饰金。
function toolIcon(key, theme) {
  const p = PATHS[key];
  if (!p) return '';
  const color = theme === 'dark' ? '#ece6dc' : '#2b2622';
  return iconDataUri(p, color);
}

// 母题图标：用于内容叙事卡片（星夜物语 / 节气来信 / 星图传记），描边用品牌金，明暗自适应
function motifIcon(key, theme) {
  const p = MOTIF_PATHS[key] || MOTIF_PATHS.star;
  const color = theme === 'dark' ? '#d9b66a' : '#c8a35a';
  return iconDataUri(p, color);
}

module.exports = { PATHS, MOTIF_PATHS, iconDataUri, toolIcon, motifIcon };
