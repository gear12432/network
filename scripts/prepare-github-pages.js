const fs = require('fs');
const path = require('path');

function makePathsRelative(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace absolute /_next/ with relative ./_next/
  content = content.replace(/(href|src)="\/_next\//g, '$1="./_next/');
  content = content.replace(/(href|src)='\/_next\//g, "$1='./_next/");

  // Replace url(/_next/ with url(./_next/
  content = content.replace(/url\(\/_next\//g, 'url(./_next/');
  content = content.replace(/url\("\/_next\//g, 'url("./_next/');
  content = content.replace(/url\('\/_next\//g, "url('./_next/");

  // Replace /assets/ with ./assets/
  content = content.replace(/(href|src)="\/assets\//g, '$1="./assets/');
  content = content.replace(/(href|src)='\/assets\//g, "$1='./assets/");

  // In Next.js router chunks, replace "/_next/" strings with "./_next/"
  content = content.replace(/"\/_next\//g, '"./_next/');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[GitHub Pages Fix] Patched relative paths in ${filePath}`);
}

// 1. Patch files in out/
const outDir = path.join(__dirname, '..', 'out');
if (fs.existsSync(outDir)) {
  const indexOut = path.join(outDir, 'index.html');
  const errorOut = path.join(outDir, '404.html');
  makePathsRelative(indexOut);
  makePathsRelative(errorOut);

  // Also patch JS chunks in out/_next/static/chunks
  const chunksDir = path.join(outDir, '_next', 'static', 'chunks');
  if (fs.existsSync(chunksDir)) {
    const chunkFiles = fs.readdirSync(chunksDir);
    for (const file of chunkFiles) {
      if (file.endsWith('.js')) {
        makePathsRelative(path.join(chunksDir, file));
      }
    }
  }

  // Copy to root so repository directly contains index.html, 404.html, _next/
  const rootIndex = path.join(__dirname, '..', 'index.html');
  const root404 = path.join(__dirname, '..', '404.html');
  const rootNext = path.join(__dirname, '..', '_next');

  fs.copyFileSync(indexOut, rootIndex);
  fs.copyFileSync(errorOut, root404);
  console.log('[GitHub Pages Fix] Copied index.html and 404.html directly to root directory.');

  // Copy out/_next to root/_next
  fs.cpSync(path.join(outDir, '_next'), rootNext, { recursive: true });
  console.log('[GitHub Pages Fix] Copied out/_next directly to root/_next directory.');

  // Create .nojekyll in root
  fs.writeFileSync(path.join(__dirname, '..', '.nojekyll'), '');
  console.log('[GitHub Pages Fix] Created .nojekyll in root directory.');
}
