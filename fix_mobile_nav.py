import os
import re

MOBILE_CSS = """
<style id="mobile-nav-fix">
/* Mobile navbar fix — inline para garantir prioridade */
@media (max-width: 900px) {
  .navbar {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    overflow: hidden !important;
    height: 60px !important;
    padding: 0 12px !important;
  }
  .nav-logo {
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    flex: 1 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }
  .nav-logo-icon,
  .nav-logo svg,
  .nav-logo img {
    width: 28px !important;
    height: 28px !important;
    flex-shrink: 0 !important;
  }
  /* Esconder texto longo do logo em mobile muito pequeno */
  @media (max-width: 400px) {
    .nav-logo-text,
    .nav-logo span:not(.nav-logo-icon) {
      display: none !important;
    }
  }
  .nav-links {
    display: none !important;
  }
  .lang-switcher {
    display: none !important;
  }
  #nav-register-btn,
  a[href*="register"],
  .btn-nav-register {
    display: none !important;
  }
  #nav-login-btn,
  .btn-nav-login {
    display: none !important;
  }
  .hamburger,
  #nav-toggle,
  .nav-toggle {
    display: flex !important;
    flex-shrink: 0 !important;
    width: 44px !important;
    height: 44px !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .nav-actions {
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
    flex-shrink: 0 !important;
  }
}
</style>
"""

# Processar todos os HTML
count = 0
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
    for file in files:
        if not file.endswith('.html'):
            continue
        filepath = os.path.join(root, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remover fix anterior se existir
        content = re.sub(r'<style id="mobile-nav-fix">.*?</style>\n?', '', content, flags=re.DOTALL)

        # Adicionar antes do </head>
        if '</head>' in content:
            content = content.replace('</head>', MOBILE_CSS + '</head>', 1)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            count += 1

print(f"Adicionado CSS inline em {count} páginas")
