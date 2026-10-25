const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const outDir = path.join(projectRoot, 'out');

function patchHtmlFile(filePath, depth = 0) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const prefix = depth > 0 ? '../'.repeat(depth) : './';

  // Replace absolute references with depth-aware relative references
  content = content.replace(/(href|src)="\/_next\//g, `$1="${prefix}_next/`);
  content = content.replace(/(href|src)='\/_next\//g, `$1='${prefix}_next/`);
  content = content.replace(/url\(\/_next\//g, `url(${prefix}_next/`);
  content = content.replace(/url\("\/_next\//g, `url("${prefix}_next/`);
  content = content.replace(/url\('\/_next\//g, `url('${prefix}_next/`);
  content = content.replace(/(href|src)="\/assets\//g, `$1="${prefix}assets/`);
  content = content.replace(/(href|src)='\/assets\//g, `$1='${prefix}assets/`);
  content = content.replace(/"\/_next\//g, `"${prefix}_next/`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[GitHub Pages Fix] Patched relative paths in ${filePath} (depth: ${depth})`);
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

  // 2. Also patch JS chunks in out/_next/static/chunks
  const chunksDir = path.join(outDir, '_next', 'static', 'chunks');
  if (fs.existsSync(chunksDir)) {
    const chunkFiles = fs.readdirSync(chunksDir);
    for (const file of chunkFiles) {
      if (file.endsWith('.js')) {
        patchHtmlFile(path.join(chunksDir, file), 0);
      }
    }
  }

  // 3. Ensure 404.html is a copy of index.html so GitHub Pages SPA fallback works for any path
  const indexOut = path.join(outDir, 'index.html');
  const errorOut = path.join(outDir, '404.html');
  if (fs.existsSync(indexOut)) {
    fs.copyFileSync(indexOut, errorOut);
    console.log('[GitHub Pages Fix] Created 404.html SPA fallback from index.html.');
  }

  // 4. Copy build artifacts directly to project root for simple GitHub Pages branch publishing
  const rootIndex = path.join(projectRoot, 'index.html');
  const root404 = path.join(projectRoot, '404.html');
  const rootNext = path.join(projectRoot, '_next');
  const rootAdminDir = path.join(projectRoot, 'admin');

  if (fs.existsSync(indexOut)) fs.copyFileSync(indexOut, rootIndex);
  if (fs.existsSync(errorOut)) fs.copyFileSync(errorOut, root404);

  // Copy out/_next directly to root/_next
  const outNext = path.join(outDir, '_next');
  if (fs.existsSync(outNext)) {
    fs.cpSync(outNext, rootNext, { recursive: true });
    console.log('[GitHub Pages Fix] Copied out/_next directly to root/_next directory.');
  }

  // Handle out/admin or out/admin.html -> root/admin/index.html & root/admin.html
  const outAdminHtml = path.join(outDir, 'admin.html');
  const outAdminIndex = path.join(outDir, 'admin', 'index.html');

  if (!fs.existsSync(rootAdminDir)) {
    fs.mkdirSync(rootAdminDir, { recursive: true });
  }

  if (fs.existsSync(outAdminIndex)) {
    fs.copyFileSync(outAdminIndex, path.join(rootAdminDir, 'index.html'));
    fs.copyFileSync(outAdminIndex, path.join(projectRoot, 'admin.html'));
    console.log('[GitHub Pages Fix] Copied admin/index.html to root admin/index.html and admin.html.');
  } else if (fs.existsSync(outAdminHtml)) {
    fs.copyFileSync(outAdminHtml, path.join(rootAdminDir, 'index.html'));
    fs.copyFileSync(outAdminHtml, path.join(projectRoot, 'admin.html'));
    console.log('[GitHub Pages Fix] Copied admin.html to root admin/index.html and admin.html.');
  } else if (fs.existsSync(indexOut)) {
    fs.copyFileSync(indexOut, path.join(rootAdminDir, 'index.html'));
    fs.copyFileSync(indexOut, path.join(projectRoot, 'admin.html'));
    console.log('[GitHub Pages Fix] Fallback copied index.html to root admin/index.html and admin.html.');
  }

  // Create .nojekyll in root
  fs.writeFileSync(path.join(projectRoot, '.nojekyll'), '');
  console.log('[GitHub Pages Fix] Created .nojekyll in root directory.');
}

