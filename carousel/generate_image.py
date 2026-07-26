#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_image.py — 用 Gemini 生成轮播 6 屏（图生图保证视觉 DNA 一致）
  · 第 1 屏：文生图（text-only），建立视觉 DNA
  · 第 2-6 屏：图生图（以 slide-1.jpg 为参考，image-to-image），保持配色/质感统一
  · 输出：slide-1.jpg ... slide-6.jpg（JPG, 768x1376, 9:16）
  · 始终输出 slide-prompts.json（含每屏标题/视觉提示词，供后续文字合成）

依赖：仅标准库（urllib/json/base64）。读取环境变量 GEMINI_API_KEY。
无 key 时：仅产出 slide-prompts.json 并打印提示词，不生成图片（安全降级）。
"""
import os, sys, json, base64, urllib.request, urllib.error, pathlib

DIR = pathlib.Path(__file__).resolve().parent
MODEL = json.load(open(DIR / "config.json", encoding="utf-8"))["gemini_model"]
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"


def build_prompt(slide: dict, brand: dict) -> str:
    visual = slide.get("visual", "")
    role = slide.get("role", "")
    headline = slide.get("text", "")
    palette = (f"warm paper {brand['paper']}, star-gold {brand['gold']}, "
               f"light gold {brand['gold_light']}, deep night blue {brand['night1']} to {brand['night2']}")
    # Gemini 文字渲染不稳定 → 生成无文字的插画底图，标题后续合成叠加
    return (
        f"Vertical 9:16 social-media carousel illustration, Chinese traditional-culture healing aesthetic, "
        f"calm and poetic. Palette: {palette}. "
        f"Scene: {visual}. "
        f"Mood for slide role '{role}': serene, mystical, hopeful, starry-night with a single warm lantern. "
        f"Composition: clean negative space at bottom 20% (leave empty, no text there), "
        f"main subject upper-center, soft golden glow, ink-wash meets modern minimal. "
        f"High detail, no text, no letters, no watermarks, no human faces in close-up. "
        f"The headline to overlay later (do NOT draw it): 「{headline}」"
    )


def call_gemini(api_key: str, prompt: str, ref_b64: str | None):
    parts = [{"text": prompt}]
    if ref_b64:
        parts.append({"inline_data": {"mime_type": "image/jpeg", "data": ref_b64}})
    body = {
        "contents": [{"parts": parts}],
        "generationConfig": {"responseModalities": ["IMAGE"], "temperature": 1.0}
    }
    req = urllib.request.Request(
        f"{API_URL}?key={api_key}",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Gemini HTTP {e.code}: {e.read().decode('utf-8')[:300]}")
    # 取第一个含图片的 part
    for cand in data.get("candidates", []):
        for p in cand.get("content", {}).get("parts", []):
            if p.get("inline_data", {}).get("data"):
                return base64.b64decode(p["inline_data"]["data"])
    raise RuntimeError("Gemini 未返回图片：" + json.dumps(data)[:300])


def main():
    analysis = json.load(open(DIR / "analysis.json", encoding="utf-8"))
    brand = analysis["brand"]
    slides = analysis["slides"]
    out_dir = DIR
    prompts_plan = []

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    has_key = bool(api_key)

    for i, slide in enumerate(slides, start=1):
        prompt = build_prompt(slide, brand)
        prompts_plan.append({
            "index": i,
            "role": slide.get("role"),
            "headline": slide.get("text"),
            "visual_direction": slide.get("visual"),
            "gemini_prompt": prompt,
        })
        if not has_key:
            print(f"[gen] 屏{i} 提示词已记录（无 GEMINI_API_KEY，跳过生图）")
            continue
        ref_b64 = None
        if i > 1:
            ref_path = out_dir / f"slide-1.jpg"
            if ref_path.exists():
                ref_b64 = base64.b64encode(ref_path.read_bytes()).decode("ascii")
        try:
            img = call_gemini(api_key, prompt, ref_b64)
            (out_dir / f"slide-{i}.jpg").write_bytes(img)
            print(f"[gen] 屏{i} 已生成 slide-{i}.jpg ({len(img)} bytes)")
        except Exception as e:
            print(f"[gen] 屏{i} 生成失败：{e}", file=sys.stderr)

    json.dump(prompts_plan, open(out_dir / "slide-prompts.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"[gen] 已写出 slide-prompts.json（{len(prompts_plan)} 屏计划）")
    if not has_key:
        print("[gen] 提示：设置 GEMINI_API_KEY 后重跑即可生成 6 张 JPG。")


if __name__ == "__main__":
    main()
