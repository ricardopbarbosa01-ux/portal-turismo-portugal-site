import os
import re

# Ler o navbar correcto do index.html
with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

navbar_match = re.search(r'<nav class="navbar".*?</nav>', index_content, re.DOTALL)
if not navbar_match:
    print("ERRO: navbar não encontrado no index.html")
    exit(1)

correct_navbar = navbar_match.group(0)
print(f"Navbar extraído do index.html ({len(correct_navbar)} chars)")

# Processar todas as páginas HTML excepto index.html e directório en/
html_files = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules' and d != 'en']
    for file in files:
        if file.endswith('.html') and file != 'index.html':
            html_files.append(os.path.join(root, file))

print(f"Encontradas {len(html_files)} páginas HTML para processar")

fixed = 0
skipped = 0

for filepath in sorted(html_files):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(
        r'<nav class="navbar".*?</nav>',
        correct_navbar,
        content,
        flags=re.DOTALL
    )

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  FIXED: {filepath}")
        fixed += 1
    else:
        print(f"  SKIP:  {filepath}")
        skipped += 1

print(f"\nResultado: {fixed} páginas corrigidas, {skipped} ignoradas")
