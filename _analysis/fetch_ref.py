# -*- coding: utf-8 -*-
import urllib.request
import re
import sys

url = 'https://jev-ai.pro/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'})
html = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', errors='replace')
out = r'E:\Desktop\个人\AI出海\01_产品项目\jev-ai\_analysis\reference_jevai.html'
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)
print('downloaded bytes:', len(html))

# Extract <style> blocks
styles = re.findall(r'<style[^>]*>(.*?)</style>', html, re.S)
print('style blocks:', len(styles))
css = '\n'.join(styles)
with open(r'E:\Desktop\个人\AI出海\01_产品项目\jev-ai\_analysis\reference_jevai.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('css chars:', len(css))

# CSS custom properties
props = re.findall(r'(--[\w-]+)\s*:\s*([^;]+);', css)
seen = {}
for k, v in props:
    seen.setdefault(k.strip(), set()).add(v.strip())
print('\n=== CSS custom properties ===')
for k in sorted(seen):
    print(k, '=', ' | '.join(sorted(seen[k])[:4]))

# Font families
fonts = re.findall(r'font-family\s*:\s*([^;]+);', css)
uniq = []
for f in fonts:
    f = f.strip()
    if f not in uniq:
        uniq.append(f)
print('\n=== font-family usages ===')
for f in uniq[:40]:
    print('-', f)
