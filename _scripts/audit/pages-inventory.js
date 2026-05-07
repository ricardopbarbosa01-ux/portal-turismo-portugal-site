const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const EXCLUDE_DIRS = ['.claude', 'node_modules', '_scripts', 'supabase', 'docs', 'pro', 'playwright-report'];
const EXCLUDE_FILES = ['_template.html', 'dashboard.html', 'conta.html', 'reset.html', 'case-study-template.html', 'proposal-template.html'];

function findHtmlFiles(dir, baseDir = dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
        findHtmlFiles(fullPath, baseDir, results);
      }
    } else if (entry.name.endsWith('.html') && !EXCLUDE_FILES.includes(entry.name)) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push('/' + relativePath);
    }
  }
  return results;
}

const pages = findHtmlFiles(ROOT);
console.log(JSON.stringify(pages, null, 2));
console.log(`Total: ${pages.length} pages`);
