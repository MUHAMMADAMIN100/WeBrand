"""Display-sized copies of the partner logos for the home page ticker.

Run it with the backend's interpreter (it has Pillow), from anywhere:

    backend/.venv/Scripts/python.exe frontend/scripts/make_partner_logos.py

The originals in frontend/public/logos stay where they are — the backend seed
copies project logos from there — and several are far bigger than a 48px-tall
plate needs (a 2295x924 PNG for a 136x48 slot). Each copy is fitted into
340x120 (2.5x the slot) and written to frontend/public/partners as WebP; a WebP
that would not get smaller is copied as it is.

When a partner is added or a logo changes: put the original in public/logos,
add its file name to NAMES, run this, and point the entry in
src/data/content.ts (`partners`) at /partners/<name>.webp.
"""
import os
import shutil

from PIL import Image

PUBLIC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public'))
NAMES = [
    'kormand.png', 'shakl.png', 'sabt.png', 'aiva.webp', 'loftory.webp', 'getup.jpg', 'asan.webp', 'armut.png',
    'star.webp', 'sapporo.webp', 'barf.webp', 'khotiri-jam.png', 'todo.webp', 'grantchina.webp', 'iram-cinema.png',
    'javonon-group.webp',
]
MAX_W, MAX_H = 340, 120

os.makedirs(os.path.join(PUBLIC, 'partners'), exist_ok=True)
before = after = 0
for name in NAMES:
    src = os.path.join(PUBLIC, 'logos', name)
    image = Image.open(src)
    image = image.convert('RGBA' if image.mode in ('RGBA', 'LA', 'P') else 'RGB')
    width, height = image.size
    scale = min(MAX_W / width, MAX_H / height, 1)
    if scale < 1:
        image = image.resize((max(1, round(width * scale)), max(1, round(height * scale))), Image.LANCZOS)
    out = os.path.join(PUBLIC, 'partners', os.path.splitext(name)[0] + '.webp')
    image.save(out, 'WEBP', quality=84, method=6, alpha_quality=100)
    size_in, size_out = os.path.getsize(src), os.path.getsize(out)
    note = 're-encoded %dx%d' % image.size
    if size_out >= size_in and name.endswith('.webp'):
        shutil.copyfile(src, out)
        size_out = size_in
        note = 'original kept'
    before += size_in
    after += size_out
    print('%-22s %6d B -> %6d B  %s' % (name, size_in, size_out, note))
print('total: %d KB -> %d KB' % (before // 1024, after // 1024))
