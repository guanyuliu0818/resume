"""Generate the 1200x630 social-sharing card from assets/avatar.jpg.

Usage: python make_ogcard.py
Requires Pillow and a Chinese font (Microsoft YaHei on Windows).
Output: assets/og-card.png, referenced by og:image / twitter:image in build.js.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (247, 249, 252)
INK = (28, 39, 58)
MUTED = (95, 108, 130)
ACCENT = (26, 74, 138)
LINE = (220, 226, 235)

img = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(img)

# Accent bar on the left
d.rectangle([0, 0, 14, H], fill=ACCENT)

# Circular portrait
av = Image.open('assets/avatar.jpg').convert('RGBA').resize((300, 300), Image.LANCZOS)
mask = Image.new('L', (300, 300), 0)
ImageDraw.Draw(mask).ellipse((0, 0, 299, 299), fill=255)
av.putalpha(mask)
img.paste(av, (95, 165), av)
d.ellipse((90, 160, 400, 470), outline=LINE, width=3)

FB = 'C:/Windows/Fonts/msyhbd.ttc'
FR = 'C:/Windows/Fonts/msyh.ttc'
f_large = ImageFont.truetype(FB, 76)
f_mid = ImageFont.truetype(FR, 36)
f_small = ImageFont.truetype(FR, 29)
f_url = ImageFont.truetype(FR, 25)

x = 455
d.text((x, 170), '刘冠宇', font=f_large, fill=INK)
d.text((x, 270), 'Guanyu Liu', font=f_mid, fill=ACCENT)
d.text((x, 335), '大气科学博士 · 电力气象与新能源功率预测', font=f_small, fill=MUTED)
d.text((x, 385), '北京大学 · 中国南方电力调度控制中心', font=f_small, fill=MUTED)

d.line([(x, 455), (1120, 455)], fill=LINE, width=2)
d.text((x, 480), 'guanyuliu0818.github.io/resume', font=f_url, fill=ACCENT)

img.save('assets/og-card.png', 'PNG', optimize=True)
print('saved assets/og-card.png', img.size)
