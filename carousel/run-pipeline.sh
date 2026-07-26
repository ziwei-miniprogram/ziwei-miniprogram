#!/usr/bin/env bash
# run-pipeline.sh — 轮播增长管线总编排
#   分析/选题 → 生成 6 屏 → (有 key 则)发布 → 学习
# 用法：bash run-pipeline.sh            # 全跑（发布需 UPLOADPOST_TOKEN）
#       bash run-pipeline.sh --no-publish   # 只生成不发布
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
PUBLISH=1
[[ "${1:-}" == "--no-publish" ]] && PUBLISH=0

echo "=== 1/4 分析选题 ==="
node analyze-web.js

echo "=== 2/4 生成 6 屏 ==="
python3 generate_image.py

if [[ "$PUBLISH" -eq 1 ]]; then
  echo "=== 3/4 发布 ==="
  bash publish-carousel.sh
  echo "=== 4/4 学习（需真实数据；先拉取）==="
  bash check-analytics.sh
  node learn-from-analytics.js
else
  echo "=== 3/4 发布 跳过（--no-publish）==="
  echo "=== 4/4 学习 跳过 ==="
fi
echo "完成。产物：analysis.json / slide-prompts.json / slide-*.jpg / (pending-post.json 或 post-info.json)"
