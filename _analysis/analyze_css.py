# -*- coding: utf-8 -*-
import re
from collections import Counter

with open(r'E:\Desktop\个人\AI出海\01_产品项目\jev-ai\_analysis\entry.css', encoding='utf-8') as f:
    css = f.read()

print('entry.css chars:', len(css))

# :root custom properties
m = re.search(r':root\s*\{([^}]*)\}', css, re.S)
if m:
    print('\n=== :root custom properties ===')
    print(m.group(1).strip()[:3000])

# all custom props anywhere
props = re.findall(r'(--[\w-]+)\s*:\s*([^;}]+)', css)
seen = {}
for k, v in props:
    seen.setdefault(k.strip(), set()).add(v.strip())
print('\n=== custom properties (name = values) ===')
for k in sorted(seen):
    vals = sorted(seen[k])
    print(f'{k} = {vals[:3]}')

# colors
hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', css)
cnt = Counter(h.upper() for h in hexes)
print('\n=== top 40 colors in entry.css ===')
for c, n in cnt.most_common(40):
    print(c, n)

# border-radius values
radii = re.findall(r'border-radius\s*:\s*([^;}]+)', css)
rc = Counter(r.strip() for r in radii)
print('\n=== border-radius top 15 ===')
for r, n in rc.most_common(15):
    print(r, n)

# box-shadow
shadows = re.findall(r'box-shadow\s*:\s*([^;}]+)', css)
sc = Counter(s.strip() for s in shadows)
print('\n=== box-shadow top 15 ===')
for s, n in sc.most_common(15):
    print(s, n)

# font sizes
fs = re.findall(r'font-size\s*:\s*([^;}]+)', css)
fc = Counter(f.strip() for f in fs)
print('\n=== font-size top 20 ===')
for f, n in fc.most_common(20):
    print(f, n)
