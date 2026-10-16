#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
silklyart.com — 把線上版本收回 repo（方案 A）

背景：
    線上 silklyart.com 跑的版本（含 GA 埋點 + 絕對路徑連結）從未進 git。
    本地 repo HEAD 是舊的相對路徑版、且零埋點。任何一次 push 都會洗掉線上埋點。

做法：
    1. 抓線上 21 頁（sitemap 真實 URL，跟隨 301 重導向）
    2. 去掉內聯 gtag 整段（loader + config），改插 analytics.js 引用 + noscript
    3. 保留線上的絕對路徑連結格式（已過線上實測，21 頁全 200）
    4. 寫回本地對應檔

冪等：頁面已含 analytics.js 引用且無內聯 gtag → 跳過。

用法：
    python tools/sync_ga.py            # dry-run
    python tools/sync_ga.py --apply    # 實際寫入
"""
import re
import sys
import pathlib
import subprocess
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITEMAP = 'https://silklyart.com/sitemap.xml'
ANALYTICS_REF = (
    '  <!-- Google Analytics 4 — silklyart.com -->\n'
    '  <script src="assets/js/analytics.js"></script>\n'
    '  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=G-THDYD5KJ4P" '
    'style="display:none;visibility:hidden" title="ga"></iframe></noscript>'
)

# 內聯 gtag 整段：註解 + loader <script> + config <script>
INLINE_GTAG_RE = re.compile(
    r'<!-- Google tag \(gtag\.js\) -->\s*'
    r'<script async src="https://www\.googletagmanager\.com/gtag/js\?id=[^"]*"></script>\s*'
    r'<script>[\s\S]*?gtag\(\'config\'[\s\S]*?</script>\s*'
)


def url_to_local(url: str) -> pathlib.Path:
    """sitemap 的絕對 URL → 本地檔。

    /                  -> index.html
    /exhibitions/      -> exhibitions.html
    /mo/               -> mo/index.html
    /mo/exhibitions/   -> mo/exhibitions.html
    /zh/about/         -> zh/about.html
    """
    path = urlparse(url).path
    p = path.strip('/')
    if not p:
        return ROOT / 'index.html'
    if p.endswith('.html'):
        p = p[:-5]
    seg0 = p.split('/')[0]
    if seg0 in ('mo', 'zh'):                      # 語言子目錄：/mo/ → mo/index.html
        rest = p[len(seg0):].strip('/')
        if not rest:
            return ROOT / seg0 / 'index.html'
        return ROOT / seg0 / (rest + '.html')
    return ROOT / (p + '.html')


def fetch(url: str) -> str:
    out = subprocess.run(
        ['curl', '-sL', '-A', 'Mozilla/5.0', url],
        capture_output=True, text=True)
    return out.stdout


def main():
    apply = '--apply' in sys.argv
    xml = fetch(SITEMAP)
    urls = re.findall(r'<loc>([^<]+)</loc>', xml)
    if not urls:
        sys.exit('[停] sitemap 抓不到 URL')

    changed, skipped, failed = [], [], []

    for u in urls:
        local = url_to_local(u)
        html = fetch(u)
        if not html or '<html' not in html.lower():
            failed.append((u, str(local), '抓取失敗'))
            continue

        # 已正確（有 analytics.js 引用且無內聯 gtag）→ 跳過
        if 'assets/js/analytics.js' in html and '<!-- Google tag (gtag.js) -->' not in html:
            skipped.append((local.name, '已含 analytics.js'))
            continue

        # 去內聯 gtag 整段
        cleaned = INLINE_GTAG_RE.sub('', html)
        if '<!-- Google tag (gtag.js) -->' in cleaned:
            failed.append((u, local.name, '內聯 gtag 未清乾淨'))
            continue
        if '</head>' not in cleaned:
            failed.append((u, local.name, '無 </head>'))
            continue
        new = cleaned.replace('</head>', ANALYTICS_REF + '\n</head>', 1)

        changed.append((local.name, len(html), len(new)))

        if apply:
            local.parent.mkdir(parents=True, exist_ok=True)
            local.write_text(new, encoding='utf-8')

    mode = 'APPLY' if apply else 'DRY-RUN（未寫入）'
    print(f'\n───── {mode} ─────')
    print(f'sitemap URL 數 : {len(urls)}')
    print(f'將寫入        : {len(changed)}')
    for n, a, b in changed:
        print(f'   + {n:24s} 線上 {a} bytes → 本地 {b} bytes')
    if skipped:
        print(f'已正確略過    : {len(skipped)}')
    if failed:
        print(f'失敗          : {len(failed)}')
        for u, n, why in failed:
            print(f'   ! {n:24s} {why}')

    if not apply and changed:
        print('\n確認無誤後加 --apply 執行。')
        print('本機 git 工作區目前乾淨，apply 後若想還原可 `git checkout -- .`')
    elif apply:
        print('\n完成。接著：你驗收後我再 commit（不會自動 push）。')


if __name__ == '__main__':
    main()