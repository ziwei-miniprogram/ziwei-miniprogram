#!/usr/bin/env bash
# check-analytics.sh — 拉取 Upload-Post 数据（需 UPLOADPOST_TOKEN / UPLOADPOST_USER）
#   · 个人主页数据：followers/likes/comments/shares/impressions
#   · 单篇数据：用 post-info.json 的 request_id 取 views/likes/comments
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
TOKEN="${UPLOADPOST_TOKEN:-}"
USER="${UPLOADPOST_USER:-}"
if [[ -z "$TOKEN" || -z "$USER" ]]; then
  echo "[analytics] 未设置 UPLOADPOST_TOKEN / UPLOADPOST_USER，跳过。"
  exit 0
fi
echo "[analytics] 拉取主页数据 ..."
curl -s "https://api.upload-post.com/api/analytics/$USER?platforms=tiktok" \
  -H "Authorization: Bearer $TOKEN" -H "x-user: $USER" > profile-analytics.json
echo "[analytics] 已写 profile-analytics.json"
if [[ -f post-info.json ]]; then
  RID=$(python3 -c 'import json;print(json.load(open("post-info.json")).get("request_id",""))')
  if [[ -n "$RID" ]]; then
    echo "[analytics] 拉取单篇数据 request_id=$RID ..."
    curl -s "https://api.upload-post.com/api/uploadposts/post-analytics/$RID" \
      -H "Authorization: Bearer $TOKEN" -H "x-user: $USER" > post-analytics.json
    echo "[analytics] 已写 post-analytics.json"
  fi
fi
