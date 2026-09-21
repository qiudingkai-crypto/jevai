# -*- coding: utf-8 -*-
import urllib.request
import re
import os

base = 'https://jev-ai.pro'
css_files = {
    '/_nuxt/entry.BwsDUqIH.css': 'entry.css',
    '/_nuxt/SiteFooter.BeXe8EC-.css': 'SiteFooter.css',
    '/_nuxt/JevPlayground.DwZAcDGr.css': 'JevPlayground.css',
}
outdir = r'E:\Desktop\个人\AI出海\01_产品项目\jev-ai\_analysis'
for path, name in css_files.items():
    url = base + path
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        data = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', errors='replace')
        with open(os.path.join(outdir, name), 'w', encoding='utf-8') as f:
            f.write(data)
        print(name, len(data))
    except Exception as e:
        print(name, 'ERROR', e)

# Patch HTML to reference local CSS
html_path = os.path.join(outdir, 'reference_jevai.html')
with open(html_path, encoding='utf-8') as f:
    html = f.read()
html = html.replace('/_nuxt/entry.BwsDUqIH.css', 'entry.css')
html = html.replace('/_nuxt/SiteFooter.BeXe8EC-.css', 'SiteFooter.css')
html = html.replace('/_nuxt/JevPlayground.DwZAcDGr.css', 'JevPlayground.css')
with open(os.path.join(outdir, 'reference_local.html'), 'w', encoding='utf-8') as f:
    f.write(html)
print('patched -> reference_local.html')
