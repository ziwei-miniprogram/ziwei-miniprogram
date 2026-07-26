// 星野漫游 · ESLint 配置（小程序 JS 静态检查）
// 目标：拦截未声明变量（如 F1 whimsy 漏 require）、TDZ 隐患、未使用变量、死代码。
module.exports = {
  root: true,
  env: { es2021: true, jest: true },
  parserOptions: { ecmaVersion: 2021, sourceType: 'script' },
  extends: ['eslint:recommended'],
  globals: {
    wx: 'readonly',
    App: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly',
    require: 'readonly',
    module: 'writable',
    exports: 'writable',
    __dirname: 'readonly',
    __filename: 'readonly',
    // 小程序运行环境全局（定时器 / 控制台）
    setInterval: 'readonly',
    clearInterval: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    console: 'readonly',
    encodeURIComponent: 'readonly',
    decodeURIComponent: 'readonly',
    global: 'writable'
  },
  rules: {
    // 致命门禁：未声明变量直接报错（抓 F1 / TDZ 类崩溃）
    'no-undef': 'error',
    // 未使用变量仅警告（不阻断合并，但评审时要清）
    'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
    'no-console': 'off',
    'camelcase': 'off',
    // 允许小程序惯用的 try/catch 空体（存储兜底）
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-prototype-builtins': 'off'
  }
};
