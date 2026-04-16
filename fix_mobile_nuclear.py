import os
import re

NEW_CSS = """<style id="mobile-nav-fix">
@media (max-width: 900px) {
  .navbar {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    overflow: hidden !important;
    padding: 0 16px !important;
    height: 60px !important;
    gap: 0 !important;
  }
  .nav-logo {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }
  .nav-logo > * { flex-shrink: 0 !important; }
  .nav-links { display: none !important; }
  .nav-actions {
    display: flex !important;
    flex-shrink: 0 !important;
    align-items: center !important;
    gap: 4px !important;
    margin-left: auto !important;
  }
  .nav-actions > *:not(#nav-toggle):not(.hamburger):not(.nav-toggle) {
    display: none !important;
  }
  #nav-toggle,
  .hamburger,
  .nav-toggle {
    display: flex !important;
    flex-shrink: 0 !important;
    width: 44px !important;
    height: 44px !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    pointer-events: all !important;
  }
}
</style>
"""

count = 0
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
    for file in files:
        if not file.endswith('.html'):
            continue
        filepath = os.path.join(root, file)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            # Remover fix anterior
            content = re.sub(r'<style id="mobile-nav-fix">.*?</style>\s*', '', content, flags=re.DOTALL)
            # Adicionar novo antes do </head>
            if '</head>' in content:
                content = content.replace('</head>', NEW_CSS + '</head>', 1)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                count += 1
        except Exception as e:
            print(f"ERRO {filepath}: {e}")

print(f"Corrigidas: {count} páginas")
