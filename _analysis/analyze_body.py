# -*- coding: utf-8 -*-
import re

with open(r'E:\Desktop\个人\AI出海\01_产品项目\jev-ai\_analysis\reference_jevai.html', encoding='utf-8') as f:
    html = f.read()

# Find the playground section markup
i = html.find('playground')
print('playground idx:', i)

# Extract body content roughly: strip script tags for readability
body = re.search(r'<body[^>]*>(.*?)</body>', html, re.S)
body_html = body.group(1) if body else html

# Remove nuxt data noise for reading
text = re.sub(r'<script.*?</script>', '', body_html, flags=re.S)

# Print the raw body markup (truncated, but meaningful chunks)
# Look for key class names to understand structure
classes = re.findall(r'class="([^"]+)"', text)
from collections import Counter
cnt = Counter()
for c in classes:
    for cls in c.split():
        cnt[cls] += 1
print('\n=== top 80 class names ===')
for cls, n in cnt.most_common(80):
    print(f'{cls}  {n}')

# Find button elements text
buttons = re.findall(r'<button[^>]*>(.*?)</button>', text, re.S)
def clean(t):
    t = re.sub(r'<[^>]+>', '', t)
    return re.sub(r'\s+', ' ', t).strip()
print('\n=== buttons ===')
for b in buttons[:30]:
    print('-', clean(b)[:100])
