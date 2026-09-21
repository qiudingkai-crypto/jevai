# -*- coding: utf-8 -*-
import re

with open(r'E:\Desktop\个人\AI出海\01_产品项目\jev-ai\_analysis\reference_jevai.html', encoding='utf-8') as f:
    html = f.read()

# external deps
links = re.findall(r'<link[^>]*>', html)
scripts = re.findall(r'<script[^>]*src=[^>]*>', html)
print('=== <link> tags ===')
for l in links[:20]:
    print('-', l[:200])
print('=== <script src> tags ===')
for s in scripts[:20]:
    print('-', s[:200])

# headings order
heads = re.findall(r'<h([1-6])[^>]*>(.*?)</h\1>', html, re.S)
def clean(t):
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t
print('\n=== headings in order ===')
for lvl, txt in heads:
    print(f'h{lvl}:', clean(txt)[:120])

# all hex colors
hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', html)
from collections import Counter
cnt = Counter(h.upper() for h in hexes)
print('\n=== top 30 colors ===')
for c, n in cnt.most_common(30):
    print(c, n)
