#!/usr/bin/env bash
# publish-carousel.sh — 通过 Upload-Post API 发布 6 屏轮播到 TikTok + Instagram
# 需要：UPLOADPOST_TOKEN、UPLOADPOST_USER 环境变量
# 注意：Upload-Post 仅支持 TikTok/Instagram。国内平台(小红书/抖音/视频号)需各自开放平台，
#       见 README「国内平台适配」一节 —— 本脚本可改为输出待发布包(图片+文案)供手动/API 发布。
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

TOKEN="${UPLOADPOST_TOKEN:-}"
USER="${UPLOADPOST_USER:-}"
CFG="$(python3 -c 'import json;print(json.load(open("config.json"))["auto_music"])')"
PRIV="$(python3 -c 'import json;print(json.load(open("config.json"))["privacy"])')"

if [[ -z "$TOKEN" || -z "$USER" ]]; then
  echo "[publish] 未设置 UPLOADPOST_TOKEN / UPLOADPOST_USER，跳过真实发布。"
  echo "[publish] 已生成待发布包：将 slide-*.jpg + analysis.json 文案汇总为 pending-post.json"
  python3 - <<'PY'
import json, glob
a=json.load(open("analysis.json",encoding="utf-8"))
slides=sorted(glob.glob("slide-*.jpg"))
caption = (a["slides"][0]["text"] + " " + " ".join(a["tags"]) + "\n\n" + a.get("disclaimer",""))
pending={"platforms":["tiktok","instagram"],"images":slides,"caption":caption,
         "title":a["slides"][0]["text"][:90],"tags":a["tags"],"auto_music":True,"privacy":a.get("privacy","PUBLIC_TO_EVERYONE")}
json.dump(pending,open("pending-post.json","w",encoding="utf-8"),ensure_ascii=False,indent=2)
print("[publish] 已写 pending-post.json（"+str(len(slides))+" 张图）")
PY
  exit 0
fi

# 构造 multipart/form-data（curl -F 自动）
ARGS=(-F "auto_add_music=true" -F "privacy_level=$PRIV" -F "async_upload=true")
for p in tiktok instagram; do ARGS+=(-F "platform[]=$p"); done
for f in $(ls slide-*.jpg | sort -V); do ARGS+=(-F "photos[]=@$f;type=image/jpeg"); done
# 文案
CAPTION="$(python3 -c 'import json,a=json.load(open("analysis.json",encoding="utf-8"));print(a["slides"][0]["text"]+" "+" ".join(a["tags"]))')"
ARGS+=(-F "caption=$CAPTION")

echo "[publish] 调用 Upload-Post API ..."
RESP=$(curl -s -X POST "https://api.upload-post.com/api/upload_photos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-user: $USER" \
  "${ARGS[@]}")
echo "$RESP" | python3 -c 'import sys,json;d=json.load(sys.stdin);print("[publish] request_id =",d.get("request_id",d))' \
  && echo "$RESP" > post-info.json \
  && echo "[publish] 已保存 post-info.json"
