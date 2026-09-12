# 星野漫游 · 代码协作规范（Trunk-Based）

> 目标：干净可读的 `main` 历史、低冲突协作、可独立回滚的原子提交。

## 1. 分支模型
- `main`：**唯一长期分支**，始终保持可部署（deployable）。任何时刻 `main` 都应能构建并通过 CI。
- 特性分支：从最新 `main` 拉取，命名 `feat/<短描述>`、`fix/<短描述>`、`chore/<短描述>`、`docs/<短描述>`，例如 `feat/dark-mode`、`fix/login-redirect`。
- **短活**：特性分支生命周期尽量 < 2 天；做完即合即删，避免长期分叉。
- **禁止直接 `push` 到 `main`**；所有改动经 PR 合并。

## 2. 提交规范（Conventional Commits）
格式：`type: 简要中文描述`（可选 `type(scope):`）
- `feat` 新功能 · `fix` 缺陷 · `chore` 构建/杂项 · `docs` 文档 · `refactor` 重构 · `test` 测试 · `style` 格式 · `perf` 性能
- 示例：`feat: 新增暗色夜灯模式与心灯浮标`
- **一个提交只做一件事**，可独立 revert（原子提交）。

## 3. 日常流程
```bash
git fetch origin
git checkout -b feat/my-feature origin/main   # 从最新 main 拉特性分支
# ... 编码 ...
git add -p                                    # 按需暂存，保持原子
git commit                                    # 走 .gitmessage 模板
git fetch origin && git rebase origin/main    # 变基到最新 main，保持线性历史
git push -u origin feat/my-feature
# 在 GitHub 开 PR 评审通过 + CI 绿 squash merge 删分支
```
- 合并方式：**Squash merge**（特性分支多个提交压成 main 上一个干净提交）或 **rebase + merge --no-ff**，保持 `main` 线性、可读。
- 解决冲突：**rebase 到 main**（不要在特性分支里 `merge main`），避免历史分叉。

## 4. PR 与评审门禁
- PR 必须关联意图说明（用 PR 模板）。
- 至少 1 人评审通过；CI（见 §7）必须通过。
- `main` 分支保护（GitHub Settings Branches）：
  - [OK] Require a pull request before merging
  - [OK] Require status checks to pass 勾选 **validate**（CI 的 `语法与安全校验` job），若启用小程序编译则再勾 **miniprogram-build**
  - [FAIL] 取消 "Allow force pushes" / "Allow deletions"

## 5. 回滚与恢复
- 已合并的问题用 `git revert <commit>`（生成反向提交），**不要** `reset --hard` 已推送历史。
- 误删本地分支：`git reflog` 找回收回。
- 事故排查：`git bisect` 二分定位引入问题的提交。

## 6. 高级技巧（按需）
```bash
git worktree add ../hotfix fix/urgent   # 并行修另一个问题时用 worktree，不切分支
git rebase -i HEAD~3                    # 合并/改写最近 3 个提交
git switch -c feat/x origin/main        # 新建特性分支
```

## 7. CI（持续集成）
配置文件：`.github/workflows/ci.yml`，在 **push 到 `main`** 与 **PR 到 `main`** 时自动运行。
- **`validate` job（必跑）**，基于 `git ls-files`（已跟踪文件）：
  1. **JS 语法校验** —— 对所有已跟踪 `.js` 跑 `node --check`（含 `pages/`、`components/`、`utils/`、`carousel/`、`cloudfunctions/`）。
  2. **JSON 合法性校验** —— 所有 `.json` 配置 `JSON.parse` 校验。
  3. **Python 编译校验** —— `carousel/*.py` 跑 `python3 -m py_compile`。
  4. **密钥扫描** —— 对源码扩展名（`.js/.json/.wxml/.wxss/.py`）正则扫描疑似硬编码密钥（`api_key`/`secret`/`token`/`password` 且值为 ≥12 字符引号串），命中即失败。
- **`miniprogram-build` job（可选）**：见 §8，需配置微信小程序 Secret 才运行。
- 任一环节失败，PR 的 status check 即标红，阻断合并。
- 本地预演（等价 `validate` 逻辑）：
  ```bash
  node -e 'const cp=require("child_process");for(const f of cp.execSync("git ls-files -- \*.js \*.json").toString().trim().split("\n")){cp.spawnSync("node",["--check",f])}'
  ```

## 8. 小程序编译校验（可选）
`miniprogram-build` job 用官方 `miniprogram-ci` 对工程做真实编译预览校验，比单纯语法检查更权威。它通过 **GitHub Secrets** 驱动，不把敏感信息入库：
1. 微信公众平台 开发管理 开发设置 生成「上传代码密钥」（private key 文件）。
2. 仓库 **Settings Secrets and variables Actions New repository secret**：
   - `WX_APPID` = 小程序 appid
   - `WX_PRIVATE_KEY` = private key 文件全文
3. 配置后，PR / 推送会自动跑 `miniprogram-ci preview`；**未配置则 job 自动跳过**，不影响合并。
4. 私钥仅存在于 Secrets 与 runner 临时文件（`chmod 600`，job 结束即销毁），仓库内 `.gitignore` 已忽略 `*.key` / `private.key`。

## 9. 新项目一键初始化
`scripts/init-miniprogram-repo.sh` 把本仓库的整套流程（git init + .gitignore + 规范 + PR 模板 + CI）Self-contained 封装，新小程序项目一行命令即可套用，保证团队流程一致。详见 `scripts/README.md`。
```bash
bash scripts/init-miniprogram-repo.sh /path/to/new-miniprogram
```
