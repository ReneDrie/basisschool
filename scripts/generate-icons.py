"""Rasterize the app's own simple star mark for iPad and PWA installation."""
from pathlib import Path
from math import cos, sin, pi
from PIL import Image, ImageDraw

target = Path(__file__).resolve().parents[1] / 'public'
for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png'), (180, 'apple-touch-icon.png')]:
    scale = 4
    n = size * scale
    image = Image.new('RGB', (n, n), '#dff080')
    draw = ImageDraw.Draw(image)
    points = []
    for i in range(10):
        angle = -pi / 2 + i * pi / 5
        radius = n * (.32 if i % 2 == 0 else .155)
        points.append((n / 2 + cos(angle) * radius, n / 2 + sin(angle) * radius))
    draw.polygon(points, fill='#344739')
    for x in [.443, .557]:
        r = n * .018
        draw.ellipse((n*x-r,n*.465-r,n*x+r,n*.465+r),fill='#dff080')
    draw.arc((n*.438,n*.48,n*.562,n*.57),0,180,fill='#dff080',width=max(1,int(n*.015)))
    image.resize((size,size),Image.Resampling.LANCZOS).save(target / name)
