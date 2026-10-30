const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const outDir = path.join(projectRoot, 'out');

function patchHtmlFile(filePath, depth = 0) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const prefix = depth > 0 ? '../'.repeat(depth) : './';

  // 1. Normalize relative or absolute _next/ asset references
  content = content.replace(/(href|src)=["'](\.\.\/|\.\/|\/network\/|\/)?_next\//g, `$1="${prefix}_next/`);
  content = content.replace(/url\(["']?(\.\.\/|\.\/|\/network\/|\/)?_next\//g, `url("${prefix}_next/`);
  content = content.replace(/(href|src)=["'](\.\.\/|\.\/|\/network\/|\/)?assets\//g, `$1="${prefix}assets/`);
  content = content.replace(/["'](\.\.\/|\.\/|\/network\/|\/)?_next\//g, `"${prefix}_next/`);

  // 2. Inject helper script into <head> for GitHub Pages subpath and admin route resilience
  if (!content.includes('window.__IS_ADMIN_ROUTE__')) {
    const adminScript = `<script>
      (function() {
        var p = window.location.pathname.toLowerCase();
        var h = window.location.hash.toLowerCase();
        var s = window.location.search.toLowerCase();
        if (p.includes('admin') || h.includes('admin') || s.includes('admin')) {
          window.__IS_ADMIN_ROUTE__ = true;
        }
      })();
    </script>`;
    content = content.replace('<head>', `<head>${adminScript}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[GitHub Pages Fix] Patched relative paths in ${filePath} (depth: ${depth}, prefix: '${prefix}')`);
}

function processDirectory(dir, relativeDepth = 0) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== '_next') {
        processDirectory(fullPath, relativeDepth + 1);
      }
    } else if (item.name.endsWith('.html')) {
      patchHtmlFile(fullPath, relativeDepth);
    }
  }
}

if (fs.existsSync(outDir)) {
  // 1. Process all HTML files recursively in out/
  processDirectory(outDir, 0);

  // 2. (Skipped: Never patch .js files directly to keep Webpack runtime intact)

  // 3. Ensure 404.html is a copy of index.html so GitHub Pages SPA fallback works
  const indexOut = path.join(outDir, 'index.html');
  const errorOut = path.join(outDir, '404.html');
  if (fs.existsSync(indexOut)) {
    fs.copyFileSync(indexOut, errorOut);
    patchHtmlFile(errorOut, 0);
    console.log('[GitHub Pages Fix] Created 404.html SPA fallback from index.html.');
  }

  // 4. Handle out/admin directory and admin.html
  const outAdminDir = path.join(outDir, 'admin');
  if (!fs.existsSync(outAdminDir)) {
    fs.mkdirSync(outAdminDir, { recursive: true });
  }

  const outAdminIndex = path.join(outAdminDir, 'index.html');
  const outAdminHtml = path.join(outDir, 'admin.html');

  // If next build produced out/admin/index.html, patch it; if not, use index.html copy
  if (!fs.existsSync(outAdminIndex) && fs.existsSync(indexOut)) {
    fs.copyFileSync(indexOut, outAdminIndex);
  }
  if (!fs.existsSync(outAdminHtml) && fs.existsSync(indexOut)) {
    fs.copyFileSync(indexOut, outAdminHtml);
  }

  patchHtmlFile(outAdminIndex, 1);
  patchHtmlFile(outAdminHtml, 0);

  // 5. Copy build artifacts directly to project root for branch publishing
  const rootIndex = path.join(projectRoot, 'index.html');
  const root404 = path.join(projectRoot, '404.html');
  const rootNext = path.join(projectRoot, '_next');
  const rootAdminDir = path.join(projectRoot, 'admin');

  if (fs.existsSync(indexOut)) {
    fs.copyFileSync(indexOut, rootIndex);
    patchHtmlFile(rootIndex, 0);
  }

  if (fs.existsSync(errorOut)) {
    fs.copyFileSync(errorOut, root404);
    patchHtmlFile(root404, 0);
  }

  const outNext = path.join(outDir, '_next');
  if (fs.existsSync(outNext)) {
    fs.cpSync(outNext, rootNext, { recursive: true });
    console.log('[GitHub Pages Fix] Copied out/_next directly to root/_next directory.');
  }

  if (!fs.existsSync(rootAdminDir)) {
    fs.mkdirSync(rootAdminDir, { recursive: true });
  }

  const rootAdminIndexFile = path.join(rootAdminDir, 'index.html');
  const rootAdminHtmlFile = path.join(projectRoot, 'admin.html');

  if (fs.existsSync(outAdminIndex)) {
    fs.copyFileSync(outAdminIndex, rootAdminIndexFile);
    fs.copyFileSync(outAdminIndex, rootAdminHtmlFile);
  }

  patchHtmlFile(rootAdminHtmlFile, 0);
  patchHtmlFile(rootAdminIndexFile, 1);
  console.log('[GitHub Pages Fix] Successfully patched root admin.html (depth 0) and root/admin/index.html (depth 1).');

  // Create .nojekyll in root
  fs.writeFileSync(path.join(projectRoot, '.nojekyll'), '');
  console.log('[GitHub Pages Fix] Created .nojekyll in root directory.');
}


