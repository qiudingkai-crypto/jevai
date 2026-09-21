# -*- coding: utf-8 -*-
from PIL import Image
import os

base = r'E:\Desktop\个人\AI出海\01_产品项目\jev-ai\dist\_shots'
for name in ['index_desktop', 'index_mobile']:
    src = os.path.join(base, name + '.png')
    img = Image.open(src)
    w, h = img.size
    out = os.path.join(base, 'crops_' + name)
    os.makedirs(out, exist_ok=True)
    # desktop: split into chunks of 2100px height; mobile: chunks of 1800px
    chunk = 2100 if 'desktop' in name else 1800
    n = 0
    for top in range(0, h, chunk):
        box = (0, top, w, min(top + chunk, h))
        img.crop(box).save(os.path.join(out, f'crop_{n}.png'))
        n += 1
    print(name, w, h, '->', n, 'crops')
