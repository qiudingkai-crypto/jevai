# -*- coding: utf-8 -*-
import re

with open(r'E:\Desktop\个人\AI出海\01_产品项目\jev-ai\_analysis\reference_jevai.html', encoding='utf-8') as f:
    html = f.read()

i = html.find('jev-play-grid')
seg = html[i: i+12000]
pretty = re.sub(r'><', '>\n<', seg)
print(pretty[:11500])
