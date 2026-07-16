#!/usr/bin/env python3
"""
Patch all 6 report-*.html files to embed data-*.html in an overlay
instead of opening in a new tab.
"""
import os
import re

BASE_DIR = "/Users/hanweb/Documents/qi-saas（改）/qi-saas/public/report-content/H26-2026"

# CSS to inject before </style>
OVERLAY_CSS = """
/* ===== 内嵌数据列表遮罩 ===== */
.data-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  align-items: center;
  justify-content: center;
}
.data-overlay.show {
  display: flex;
}
.data-overlay-inner {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
.data-overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.data-overlay-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.data-overlay-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.data-overlay-close:hover {
  background: #e8e8e8;
  color: #333;
}
.data-overlay-body {
  flex: 1;
  overflow: hidden;
}
.data-overlay-body iframe {
  width: 100%;
  height: 100%;
  border: none;
}
"""

# HTML overlay element to inject before </body>
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
  // 清除 iframe src 以停止加载
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

DOMAIN_MAP = {
    "report-一网通办.html": "一网通办",
    "report-一网协同.html": "一网协同",
    "report-人工智能.html": "人工智能",
    "report-门户网站.html": "门户网站",
    "report-数据要素.html": "数据要素",
    "report-市场监管.html": "市场监管",
}

for filename in DOMAIN_MAP:
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"SKIP: {filename} not found")
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    domain = DOMAIN_MAP[filename]
    print(f"Processing: {filename} (domain: {domain})")

    # 1. Inject CSS before </style>
    if '</style>' in content and '.data-overlay' not in content:
        content = content.replace('</style>', OVERLAY_CSS + '\n</style>')
        print(f"  - Injected CSS")

    # 2. Replace the source-popup-btn link
    if 'source-popup-btn' in content:
        old_pattern = 'id="sourcePopupBtn" target="_blank">'
        new_pattern = 'id="sourcePopupBtn" onclick="event.preventDefault(); openDataOverlay(this.href);">'
        if old_pattern in content:
            content = content.replace(old_pattern, new_pattern)
            print(f"  - Replaced source-popup-btn target")
        else:
            print(f"  - target='_blank' pattern not found, checking content...")

    # 3. Inject overlay HTML + JS before </body>
    if 'data-overlay' not in content:
        if '</body>' in content:
            content = content.replace('</body>', OVERLAY_HTML + '\n</body>')
            print(f"  - Injected overlay HTML + JS")
        else:
            print(f"  - WARNING: </body> not found")

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  Done: {filename}")

print("\nAll files processed.")