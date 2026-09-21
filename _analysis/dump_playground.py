# -*- coding: utf-8 -*-
import re

with open(r'E:\Desktop\个人\AI出海\01_产品项目\jev-ai\_analysis\reference_jevai.html', encoding='utf-8') as f:
    html = f.read()

print('total len:', len(html))
# show the playground region: find 'Jev AI playground'
i = html.find('Jev AI playground')
print('playground text idx:', i)
seg = html[max(0,i-3000): i+9000]
# pretty print by inserting newlines before tags
pretty = re.sub(r'><', '>\n<', seg)
print(pretty[:8500])
