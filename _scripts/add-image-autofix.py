#!/usr/bin/env python3
"""Add onerror=autoFixImage and data-fallback-keyword to all card <img> tags.
Also inserts /js/image-autofix.js script include before </body>.
Run from Portal-turismo-site root."""

import re
import os

PHOTO_KEYWORDS = {
    'photo-1502680390548-bdbac40e4ce3': 'surf portugal coast wave',
    'photo-1530870110042-98b2cb110834': 'baleal peniche surf beach portugal',
    'photo-1455729552865-3658a5d39692': 'surf ericeira portugal beach',
    'photo-1509914398892-963f53e6e2f1': 'amado algarve surf beach',
    'photo-1464822759023-fed622ff2c3b': 'caparica lisbon surf beach',
    'photo-1505118380757-91f5f5632de0': 'matosinhos porto surf beach',
    'photo-1562760156-9353a70352ef': 'algarve beach aerial cliffs portugal',
    'photo-1651237110403-2c6b2cc2a116': 'marinha beach algarve limestone cliff',
    'photo-1560242374-7befcc667b39': 'benagil cave algarve beach',
    'photo-1520250497591-112f2f40a3f4': 'algarve beach orange cliffs portugal',
    'photo-1507003211169-0a1dd7228f2d': 'algarve hidden cove beach',
    'photo-1568605114967-8130f3a36994': 'algarve secret beach rock cave',
    'photo-1589308078059-be1415eab4c3': 'tavira island beach algarve',
    'photo-1507525428034-b723cf961d3e': 'portugal beach atlantic coast',
    'photo-1473116763249-2faaef81ccda': 'lagoon boardwalk beach portugal',
    'photo-1551632436-cbf8dd35adfa': 'beach river portugal atlantic',
    'photo-1527090526205-beadb3b827e0': 'surf beach medieval fort portugal',
    'photo-1465146344425-f00d5f5c8f07': 'wild beach dunes pines portugal',
    'photo-1625183656263-171183307b15': 'fisherman atlantic coast portugal dawn',
    'photo-1500402448245-d49c5229c564': 'minho river fishing portugal',
    'photo-1559827291-72ee739d0d9a': 'alqueva lake fishing boat sunset',
    'photo-1504124297340-f8da3b95c8c7': 'big game fishing atlantic marlin',
    'photo-1558642452-9d2a7deb7f62': 'cascais coast beach atlantic portugal',
    'photo-1484821582734-6692f3af11c5': 'guincho beach sintra natural park portugal',
    'photo-1585208798174-6cedd86e019a': 'lisbon panoramic view tagus river',
}

FILES = [
    'guias/surf-portugal-iniciantes.html',
    'guias/melhores-praias-algarve.html',
    'guias/pesca-portugal.html',
    'guias/praias-perto-lisboa.html',
    'guias/quando-visitar-portugal.html',
    'guias.html',
    'surf.html',
    'pesca.html',
    'webcams.html',
    'en/surf.html',
    'en/pesca.html',
    'en/webcams.html',
]

def add_attrs_to_img(tag):
    """Return (new_tag, keyword) or (tag, None) if unchanged."""
    if 'autoFixImage' in tag:
        return tag, None

    m = re.search(r'/(photo-[a-zA-Z0-9-]+)[?&]', tag)
    if not m:
        return tag, None

    photo_id = m.group(1)
    keyword = PHOTO_KEYWORDS.get(photo_id, 'portugal coast beach')

    src_m = re.search(r'\n(\s+)src=', tag)
    if not src_m:
        return tag, None
    attr_indent = src_m.group(1)

    close_m = re.search(r'\n(\s*)>\s*$', tag)
    if not close_m:
        return tag, None
    close_indent = close_m.group(1)

    new_attrs = (
        f'\n{attr_indent}onerror="autoFixImage(this)"'
        f'\n{attr_indent}data-fallback-keyword="{keyword}"'
    )

    close_str = '\n' + close_indent + '>'
    insert_pos = tag.rfind(close_str)
    if insert_pos == -1:
        return tag, None

    new_tag = tag[:insert_pos] + new_attrs + tag[insert_pos:]
    return new_tag, keyword


base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
total_imgs = 0

for filepath in FILES:
    full = os.path.join(base, filepath)
    if not os.path.exists(full):
        print(f'SKIP (not found): {filepath}')
        continue

    with open(full, 'rb') as f:
        raw = f.read()

    has_bom = raw.startswith(b'\xef\xbb\xbf')
    content = raw[3:].decode('utf-8') if has_bom else raw.decode('utf-8')

    file_imgs = [0]

    def replace_img(m, _counter=file_imgs):
        tag = m.group(0)
        new_tag, kw = add_attrs_to_img(tag)
        if new_tag != tag:
            _counter[0] += 1
        return new_tag

    new_content = re.sub(r'<img\b[^>]*>', replace_img, content, flags=re.DOTALL)

    if 'image-autofix.js' not in new_content:
        new_content = new_content.replace(
            '</body>',
            '  <script src="/js/image-autofix.js" defer></script>\n</body>',
            1
        )

    encoded = new_content.encode('utf-8')
    if has_bom:
        encoded = b'\xef\xbb\xbf' + encoded

    with open(full, 'wb') as f:
        f.write(encoded)

    total_imgs += file_imgs[0]
    print(f'OK {filepath}: {file_imgs[0]} imgs modified')

print(f'\nTotal imgs modified: {total_imgs}')
print('Done.')
