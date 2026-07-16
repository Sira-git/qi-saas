#!/usr/bin/env python3
"""
Fix: inject overlay HTML + JS into report files that only have CSS.
"""
import os

BASE_DIR = "/Users/hanweb/Documents/qi-saas（改）/qi-saas/public/report-content/H26-2026"

OVERLAY_HTML = """
<!-- 内嵌数据列表遮罩 -->
<div class="data-overlay" id="dataOverlay">
  <div class="data-overlay-inner">
    <div class="data-overlay-header">
      <h3 id="dataOverlayTitle">完整原始数据列表</h3>
      <button class="data-overlay-close" onclick="closeDataOverlay()">&times;</button>
    </div>
    <div class="data-overlay-body">
      <iframe id="dataOverlayIframe" src=""></iframe>
    </div>
  </div>
</div>

<script>
// 内嵌数据列表遮罩功能
function openDataOverlay(url) {
  var overlay = document.getElementById('dataOverlay');
  var iframe = document.getElementById('dataOverlayIframe');
  iframe.src = url;
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeDataOverlay() {
  var overlay = document.getElementById('dataOverlay');
  var iframe = document.getElementById('dataOverlayIframe');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  setTimeout(function() { iframe.src = ''; }, 300);
}

// 点击遮罩背景关闭
document.getElementById('dataOverlay').addEventListener('click', function(e) {
  if (e.target === this) {
    closeDataOverlay();
  }
});

// ESC 键关闭
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeDataOverlay();
  }
});
</script>
"""

DOMAINS = [
    "report-一网通办.html",
    "report-一网协同.html",
    "report-人工智能.html",
    "report-门户网站.html",
    "report-数据要素.html",
    "report-市场监管.html",
]

for filename in DOMAINS:
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"SKIP: {filename}")
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Only inject if JS function is missing
    if 'openDataOverlay' not in content or 'dataOverlay' not in content:
        content = content.replace('</body>', OVERLAY_HTML + '\n</body>')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched: {filename}")
    else:
        print(f"OK: {filename} (already has overlay JS)")

print("Done.")