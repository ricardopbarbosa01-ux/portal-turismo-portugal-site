"""Fix remaining English aria-labels in footers of root PT pages."""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGES = ["index.html","planear.html","precos.html","parceiros.html","media-kit.html","contact.html","login.html"]

FIXES = [
    ('aria-label="Destinations"', 'aria-label="Destinos"'),
    ('aria-label="Partners &amp; Help"', 'aria-label="Parceiros &amp; Ajuda"'),
    ('<h5>Partners &amp; Help</h5>', '<h5>Parceiros &amp; Ajuda</h5>'),
    ('<h5>Destinations</h5>', '<h5>Destinos</h5>'),
]

for fname in PAGES:
    path = os.path.join(BASE, fname)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    for old, new in FIXES:
        content = content.replace(old, new)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print(f"  Fixed  {fname}")

print("Done.")
