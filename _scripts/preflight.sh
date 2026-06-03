#!/usr/bin/env bash
# preflight.sh — PTH pre-task sanity checks
set -e

ERRORS=0

echo "=== PTH Preflight ==="

# 1. Git state
echo -n "[git] branch: "
git -C "$(dirname "$0")/.." rev-parse --abbrev-ref HEAD

echo -n "[git] HEAD: "
git -C "$(dirname "$0")/.." rev-parse --short HEAD

MODIFIED=$(git -C "$(dirname "$0")/.." status --porcelain | grep -c "^ M\|^M " || true)
if [ "$MODIFIED" -gt 0 ]; then
  echo "[WARN] $MODIFIED modified tracked file(s) in working tree"
else
  echo "[git] working tree clean (tracked files)"
fi

# 2. Node / npm
if command -v node &>/dev/null; then
  echo "[node] $(node --version)"
else
  echo "[FAIL] node not found"; ERRORS=$((ERRORS+1))
fi

if command -v npm &>/dev/null; then
  echo "[npm] $(npm --version)"
else
  echo "[FAIL] npm not found"; ERRORS=$((ERRORS+1))
fi

# 3. node_modules
if [ -d "$(dirname "$0")/../node_modules" ]; then
  echo "[deps] node_modules present"
else
  echo "[WARN] node_modules missing — run npm install"
fi

# 4. Playwright
if [ -f "$(dirname "$0")/../playwright.config.ts" ]; then
  echo "[playwright] playwright.config.ts found"
else
  echo "[FAIL] playwright.config.ts missing"; ERRORS=$((ERRORS+1))
fi

# 5. Key config
if [ -f "$(dirname "$0")/../js/config.js" ]; then
  echo "[config] js/config.js present"
else
  echo "[FAIL] js/config.js missing"; ERRORS=$((ERRORS+1))
fi

# 6. Nav target pages
for f in escolas-de-surf.html en/surf-schools.html; do
  if [ -f "$(dirname "$0")/../$f" ]; then
    echo "[target] $f present"
  else
    echo "[FAIL] $f missing"; ERRORS=$((ERRORS+1))
  fi
done

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "PREFLIGHT FAILED — $ERRORS error(s). Fix before continuing."
  exit 1
else
  echo "PREFLIGHT OK"
fi
