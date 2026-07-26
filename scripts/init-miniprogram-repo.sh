#!/usr/bin/env bash
# init-miniprogram-repo.sh —— 微信小程序仓库「从零建仓 + Trunk-Based 规范 + CI + 远程托管」一键初始化
# 用法：
#   ./init-miniprogram-repo.sh [目标目录] [选项]
# 选项：
#   --remote <host>   远程托管：github | gitee（不传则交互询问，非交互则跳过）
#   --repo <name>     仓库名（默认取目标目录名）
#   --public          远程仓库公开（默认 private）
#   --private         远程仓库私有（默认）
#   -h, --help        显示帮助
# 效果：git init -b main + 规范 + CI +（可选）连接 GitHub/Gitee 远程
# 说明：自包含，不依赖外部文件；生成的仓库结构与本项目一致。
set -euo pipefail

# ---------- 参数解析 ----------
TARGET="."
REMOTE_HOST=""
REPO_NAME=""
REMOTE_VISIBILITY="private"

while [ $# -gt 0 ]; do
  case "$1" in
    --remote)  REMOTE_HOST="$2"; shift 2 ;;
    --repo)    REPO_NAME="$2";   shift 2 ;;
    --public)  REMOTE_VISIBILITY="public";  shift ;;
    --private) REMOTE_VISIBILITY="private"; shift ;;
    -h|--help)
      cat <<'USAGE'
用法：
  ./init-miniprogram-repo.sh [目标目录] [选项]

选项：
  --remote <host>   远程托管：github | gitee（不传则交互询问，非交互则跳过）
  --repo <name>     仓库名（默认取目标目录名）
  --public          远程仓库公开（默认 private）
  --private         远程仓库私有（默认）
  -h, --help        显示本帮助

示例：
  ./init-miniprogram-repo.sh . --remote github --repo xingye-manyou
  ./init-miniprogram-repo.sh ../new-app --remote gitee --public
USAGE
      exit 0 ;;
    *) TARGET="$1"; shift ;;
  esac
done

if [ ! -d "$TARGET" ]; then mkdir -p "$TARGET"; fi
cd "$TARGET"
ABSPATH="$(pwd)"

if [ -d .git ]; then
  echo "❌ $ABSPATH 已存在 .git，跳过以免破坏现有仓库。"; exit 1
fi

echo "🚀 在 $ABSPATH 初始化小程序仓库..."

# ---------- .gitignore ----------
cat > .gitignore <<'GITIGNORE_EOF'
# 微信开发者工具本地配置（含机器相关路径，勿提交）
project.private.config.json
*.zip
miniprogram_npm/

# 小程序依赖（如引入 npm 构建）
node_modules/

# Python 缓存（carousel 等脚本）
__pycache__/
*.pyc

# 密钥 / 环境变量（CI 通过 GitHub Secrets 注入，禁止入库）
.env
.env.*
*.key
private.key
*.pem
secret*

# 系统 / 编辑器
.DS_Store
Thumbs.db
*.swp

# 助手本地状态（WorkBuddy）
.workbuddy/
GITIGNORE_EOF

# ---------- .gitmessage（提交模板） ----------
cat > .gitmessage <<'GITMESSAGE_EOF'
# 提交类型（必填，小写）：feat / fix / chore / docs / refactor / test / style / perf
# 范围（可选）：type(scope):
# 标题（必填）：简明中文，祈使句，≤50 字，结尾无句号
#
# 示例：
#   feat: 新增暗色夜灯模式与心灯浮标
#   fix(login): 修复微信登录回调空态崩溃
#
# 正文（可选）：为什么改、影响范围，与标题空一行
GITMESSAGE_EOF

# ---------- .github/PULL_REQUEST_TEMPLATE.md ----------
mkdir -p .github/workflows
cat > .github/PULL_REQUEST_TEMPLATE.md <<'PR_EOF'
## 变更说明
<!-- 这一笔改了什么、为什么改 -->

## 变更类型
- [ ] feat 新功能
- [ ] fix 缺陷
- [ ] docs 文档
- [ ] chore 构建/杂项
- [ ] refactor 重构

## 自检
- [ ] 已 `git rebase origin/main` 保持线性历史
- [ ] `node --check` 相关 JS 通过
- [ ] 无硬编码密钥/敏感信息

## 关联
<!-- 关联需求 / 议题 -->
PR_EOF

# ---------- .github/workflows/ci.yml ----------
cat > .github/workflows/ci.yml <<'CI_EOF'
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  validate:
    name: 语法与安全校验
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: 全量语法与安全校验
        run: |
          node -e '
            const fs = require("fs"), cp = require("child_process"), path = require("path");
            const src = cp.execSync("git ls-files").toString().trim().split("\n");
            const exts = { ".js": 1, ".json": 1, ".wxml": 1, ".wxss": 1, ".py": 1 };
            const files = src.filter(f => exts[path.extname(f)]);
            const byExt = {};
            for (const f of files) { (byExt[path.extname(f)] = byExt[path.extname(f)] || []).push(f); }
            let code = 0;

            // 1) JS 语法校验 (node --check)
            let jsErr = 0;
            for (const f of (byExt[".js"] || [])) {
              const r = cp.spawnSync("node", ["--check", f]);
              if (r.status !== 0) { console.log("::error file=" + f + "::JS 语法错误\n" + r.stderr.toString()); jsErr++; }
            }
            console.log(jsErr ? ("❌ " + jsErr + " 个 JS 语法错误") : ("✅ JS 语法通过 (" + (byExt[".js"] || []).length + " 个)"));

            // 2) JSON 合法性校验
            let jsonBad = 0;
            for (const f of (byExt[".json"] || [])) {
              try { JSON.parse(fs.readFileSync(f, "utf8")); }
              catch (e) { console.log("::error file=" + f + "::JSON 非法: " + e.message); jsonBad++; }
            }
            console.log(jsonBad ? ("❌ " + jsonBad + " 个非法 JSON") : ("✅ JSON 合法 (" + (byExt[".json"] || []).length + " 个)"));

            // 3) Python 编译校验
            let pyErr = 0;
            for (const f of (byExt[".py"] || [])) {
              const r = cp.spawnSync("python3", ["-m", "py_compile", f]);
              if (r.status !== 0) { console.log("::error file=" + f + "::Python 编译失败\n" + r.stderr.toString()); pyErr++; }
            }
            console.log(pyErr ? ("❌ " + pyErr + " 个 Python 编译失败") : ("✅ Python 编译通过 (" + (byExt[".py"] || []).length + " 个)"));

            // 4) 密钥/敏感信息扫描 (仅源码扩展名, 值需 >=12 字符引号串)
            const Q = "[\"\x27]";
            const re = new RegExp("(api[_-]?key|secret|token|password|passwd)\\s*[:=]\\s*" + Q + "[A-Za-z0-9_-]{12,}" + Q, "gi");
            let hit = 0;
            for (const f of files) {
              const m = fs.readFileSync(f, "utf8").match(re);
              if (m) { console.log("::error file=" + f + "::疑似硬编码密钥: " + m[0].slice(0, 40)); hit++; }
            }
            console.log(hit ? ("❌ " + hit + " 处疑似硬编码密钥") : "✅ 未检测到硬编码密钥");

            code = (jsErr || jsonBad || pyErr || hit) ? 1 : 0;
            process.exit(code);
          '

  miniprogram-build:
    name: 小程序编译校验（可选）
    runs-on: ubuntu-latest
    needs: validate
    # 仅当仓库配置了微信小程序 Secret 时运行；未配置则整 job 跳过，不阻塞合并
    if: ${{ secrets.WX_APPID != '' && secrets.WX_PRIVATE_KEY != '' }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: 写入上传私钥
        run: printf '%s' "${{ secrets.WX_PRIVATE_KEY }}" > ./private.key && chmod 600 ./private.key

      - name: 安装 miniprogram-ci
        run: npm install miniprogram-ci --no-save

      - name: 编译预览校验
        run: npx miniprogram-ci preview --appid "${{ secrets.WX_APPID }}" --private-key-path ./private.key --project-path . --upload-version "1.0.${{ github.run_number }}" --qrcode-output-dest preview.jpg
CI_EOF

# ---------- CONTRIBUTING.md（精简版，结构同本项目） ----------
cat > CONTRIBUTING.md <<'CONTRIB_EOF'
# 小程序代码协作规范（Trunk-Based）

## 1. 分支模型
- `main`：唯一长期分支，始终保持可部署。
- 特性分支：`feat/<desc>` / `fix/<desc>` / `chore/<desc>` / `docs/<desc>`，从最新 `main` 拉取，生命周期 < 2 天。
- 禁止直接 push `main`，改动经 PR。

## 2. 提交规范（Conventional Commits）
`type: 简要中文描述`（可选 `type(scope):`）。
类型：feat / fix / chore / docs / refactor / test / style / perf。一个提交只做一件事。

## 3. 日常流程
```bash
git fetch origin
git checkout -b feat/x origin/main
# 编码 → git add -p → git commit（走 .gitmessage）
git fetch origin && git rebase origin/main
git push -u origin feat/x
# 开 PR → 评审 + CI 绿 → squash merge → 删分支
```

## 4. PR 与分支保护
- 至少 1 人评审；CI（见 §5）必须通过。
- `main` 保护：禁直接 push、要求 PR、要求 status check `validate`（及可选 `miniprogram-build`）。

## 5. CI
`.github/workflows/ci.yml`：`push/PR → main` 触发。
- `validate`：JS 语法 / JSON 合法 / Python 编译 / 密钥扫描（始终运行）。
- `miniprogram-build`：仅当配置了 `secrets.WX_APPID` 与 `secrets.WX_PRIVATE_KEY` 时运行，用 `miniprogram-ci` 做编译预览校验；未配置则自动跳过。
- 本地预演：`node -e 'const cp=require("child_process");for(const f of cp.execSync("git ls-files -- \*.js \*.json").toString().trim().split("\n")){cp.spawnSync("node",["--check",f])}'`

## 6. 回滚
问题用 `git revert <commit>`，勿 `reset --hard` 已推送历史；`git reflog` / `git bisect` 用于恢复与定位。
CONTRIB_EOF

# ---------- git init + 配置 + 初始提交 ----------
git init -b main
git config commit.template .gitmessage
if [ -z "$(git config user.name)" ]; then
  git config user.name "fanyunjian"
  git config user.email "fanyunjian@local"
  echo "⚠️  提交身份暂用占位符 fanyunjian@local；push 前请改真实 GitHub 账号："
  echo "    git config user.name '你的名' && git config user.email 'you@example.com'"
  echo "    git rebase --root --exec 'git commit --amend --reset-author --no-edit'"
fi

git add -A
git commit -q -m "chore: 初始化小程序仓库（.gitignore + 协作规范 + CI）" || echo "（无文件可提交，跳过）"

# ---------- 远程托管（GitHub / Gitee 分支） ----------
connect_remote() {
  local host="$1"
  local repo="${REPO_NAME:-$(basename "$ABSPATH")}"
  local owner=""

  case "$host" in
    github|GitHub|gh|GH)
      echo "🌐 连接 GitHub（gh 接法优先，git remote 兜底）..."
      if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
        owner="$(gh api user --jq .login 2>/dev/null || true)"
        if [ -n "$owner" ]; then
          echo "   gh 已登录（$owner），创建并推送仓库..."
          if gh repo create "$repo" --"$REMOTE_VISIBILITY" --source . --remote origin --push 2>/dev/null; then
            echo "✅ GitHub 仓库已创建并推送（$(git remote get-url origin)）。"
            return 0
          fi
          echo "   ⚠️  gh 建仓/推送失败（可能已存在或权限不足），转 git remote 兜底。"
        fi
      elif command -v gh >/dev/null 2>&1; then
        echo "   ⚠️  检测到 gh 但未登录；请先 'gh auth login'，下面用 git remote 兜底。"
      else
        echo "   ℹ️  未检测到 gh CLI，使用 git remote 接法（SSH）。"
      fi
      # 兜底：git remote add origin（若尚不存在）
      if git remote get-url origin >/dev/null 2>&1; then
        echo "   ℹ️  origin 已存在：$(git remote get-url origin)"
      else
        read -r -p "   请输入 GitHub 用户名（用于 git@github.com:<用户>/$repo.git）: " owner
        git remote add origin "git@github.com:$owner/$repo.git"
        echo "✅ 已添加 origin（SSH）。推送：git push -u origin main"
      fi
      ;;

    gitee|Gitee|gt|GT)
      echo "🌐 连接 Gitee（git remote 接法；Gitee 无官方 gh 类 CLI）..."
      # 若提供 GITEE_TOKEN（开放 API），尝试自动建仓
      if [ -n "${GITEE_TOKEN:-}" ]; then
        echo "   检测到 GITEE_TOKEN，尝试通过 API 创建仓库..."
        if curl -s -X POST "https://gitee.com/api/v5/user/repos" \
            -H "Content-Type: application/json" \
            -d "{\"access_token\":\"$GITEE_TOKEN\",\"name\":\"$repo\",\"private\":$([ "$REMOTE_VISIBILITY" = private ] && echo true || echo false)}" \
            >/dev/null 2>&1; then
          echo "✅ Gitee 仓库已通过 API 创建。"
        else
          echo "   ⚠️  API 建仓失败（可能重名/无权限），请在网页端手动建仓。"
        fi
      fi
      if git remote get-url origin >/dev/null 2>&1; then
        echo "   ℹ️  origin 已存在：$(git remote get-url origin)"
      else
        read -r -p "   请输入 Gitee 用户名（用于 git@gitee.com:<用户>/$repo.git）: " owner
        git remote add origin "git@gitee.com:$owner/$repo.git"
        echo "✅ 已添加 origin（SSH）。推送：git push -u origin main"
      fi
      ;;

    skip|none|"")
      echo "⏭️  跳过远程连接。"
      ;;
    *)
      echo "⚠️  未知托管类型：$host，跳过。"
      ;;
  esac
}

# 连接方式：显式 --remote 优先；交互终端询问；非交互且无 --remote 则跳过
if [ -n "$REMOTE_HOST" ]; then
  connect_remote "$REMOTE_HOST"
elif [ -t 0 ]; then
  echo
  read -r -p "🌐 连接远程托管？输入 github / gitee / 直接回车跳过: " REMOTE_HOST_INPUT
  connect_remote "$REMOTE_HOST_INPUT"
else
  echo "ℹ️  非交互环境且未指定 --remote，跳过远程连接（可后续手动 git remote add）。"
fi

echo
echo "✅ 初始化完成。已生成："
echo "   .gitignore  .gitmessage  CONTRIBUTING.md"
echo "   .github/PULL_REQUEST_TEMPLATE.md  .github/workflows/ci.yml"
echo
if git remote get-url origin >/dev/null 2>&1; then
  echo "🔗 远程已连接：$(git remote get-url origin)"
  echo "📌 下一步："
  echo "   1) 改真实提交身份（若仍是占位符）"
  echo "   2) 分支保护勾选 status check：validate（+ miniprogram-build 若启用）"
  echo "   3) 启用小程序编译校验：仓库 Settings → Secrets 添加 WX_APPID / WX_PRIVATE_KEY"
else
  echo "📌 下一步："
  echo "   1) 改真实提交身份（若仍是占位符）"
  echo "   2) 连远程（--remote github/gitee 或手动）：git remote add origin <url> && git push -u origin main"
  echo "   3) 分支保护勾选 status check：validate（+ miniprogram-build 若启用）"
  echo "   4) 启用小程序编译校验：仓库 Settings → Secrets 添加 WX_APPID / WX_PRIVATE_KEY"
fi
