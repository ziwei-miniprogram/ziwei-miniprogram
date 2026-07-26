# 小程序仓库初始化脚本 `scripts/init-miniprogram-repo.sh`

## 作用
把「微信小程序从零建仓 + Trunk-Based 协作规范 + GitHub Actions CI」封装为一行命令，新项目直接套用，保证团队流程一致、可复用。

## 用法
```bash
# 在当前目录初始化
bash scripts/init-miniprogram-repo.sh

# 在指定目录初始化
bash scripts/init-miniprogram-repo.sh /path/to/new-miniprogram

# 一步连上 GitHub（gh 接法优先：自动建仓+推送；无 gh 则退到 git remote）
bash scripts/init-miniprogram-repo.sh . --remote github --repo xingye-manyou

# 一步连上 Gitee（git remote 接法；可选 GITEE_TOKEN 经 API 自动建仓）
GITEE_TOKEN=xxxx bash scripts/init-miniprogram-repo.sh . --remote gitee --public
```

## 远程托管选项（--remote）
| 托管   | 接法                                                         | 行为                                                                 |
|--------|--------------------------------------------------------------|----------------------------------------------------------------------|
| github | `gh` 接法优先 → `git remote` 兜底                            | 装了 `gh` 且已登录：自动 `gh repo create --remote origin --push`；否则提示用户名后用 `git@github.com:<用户>/<repo>.git` |
| gitee  | `git remote` 接法（Gitee 无官方 gh 类 CLI）                  | 有 `GITEE_TOKEN` 时先经开放 API 建仓；再 `git@gitee.com:<用户>/<repo>.git` |
| 不传   | —                                                            | 交互终端会询问；非交互（如 CI）则跳过，留待手动 `git remote add`       |

附加选项：`--repo <name>`（仓库名，默认取目录名）、`--public`/`--private`（可见性，默认 private）。

## 生成内容
- `.gitignore`（微信小程序 + Python + macOS + 密钥 + .workbuddy）
- `.gitmessage`（Conventional Commits 提交模板），并自动 `git config commit.template`
- `CONTRIBUTING.md`（分支模型 / 提交规范 / PR 门禁 / CI 说明）
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/ci.yml`（`validate` 必跑 + `miniprogram-build` 可选）
- 自动 `git init -b main` + 一个原子初始提交

## 前置
- 已安装 git
- 目标目录应为「尚无 `.git` 的小程序代码根」；若已存在 `.git`，脚本会安全退出以免破坏现有仓库

## 启用小程序编译校验（可选）
1. 微信公众平台 → 开发管理 → 开发设置 → 生成「上传代码密钥」（private key 文件）
2. 仓库 **Settings → Secrets and variables → Actions → New repository secret**：
   - `WX_APPID` = 小程序 appid
   - `WX_PRIVATE_KEY` = private key 文件全文
3. 之后 PR / 推送会自动跑 `miniprogram-ci preview` 编译校验；未配置则 `miniprogram-build` job 自动跳过，不阻塞合并。

## 改真实提交身份（首次 push 前）
脚本默认用占位符 `fanyunjian@local`；仓库未推送时可安全重写作者：
```bash
git config user.name  "你的 GitHub 名"
git config user.email "you@example.com"
git rebase --root --exec 'git commit --amend --reset-author --no-edit'
```
