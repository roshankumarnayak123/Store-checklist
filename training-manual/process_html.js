const fs = require('fs');

let html = fs.readFileSync('training_manual.html', 'utf8');

// 1. Extract CSS
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    let css = styleMatch[1];
    
    const pageIndex = css.indexOf('@page {');
    if (pageIndex !== -1) {
        css = css.replace(/@page\s*\{[\s\S]*?\}\s*\}/, ''); 
    }
    
    // Add some responsive media queries
    css += `
/* Responsive Adjustments */
@media screen and (max-width: 768px) {
  .cover-page {
    padding: 20px 16px !important;
  }
  .cover-hero-grid, .cover-meta-grid, .arch-grid, .toc-grid {
    grid-template-columns: 1fr;
  }
  body {
    padding: 16px;
  }
}
`;
    fs.writeFileSync('styles.css', css.trim());
    
    // Replace <style>...</style> with <link>
    html = html.replace(styleMatch[0], '<link rel="stylesheet" href="styles.css">');
}

// 2. Semantic Tags (Idempotent)
if (html.includes('<div class="cover-page">')) {
    html = html.replace(/<div class="cover-page">/, '<header class="cover-page">');
}
if (html.includes('<!-- ==================== MODULE 1 ==================== -->') && html.includes('</div>\n  <!-- ==================== MODULE 1')) {
    html = html.replace(/<\/div>\s*<!-- ==================== MODULE 1/, '</header>\n\n  <main>\n  <!-- ==================== MODULE 1');
}

html = html.replace(/<div class="avoid-break">/g, '<section class="avoid-break">');

// Safely close main if not already closed properly
if (!/<\/main>\s*<\/body>/.test(html) && !/<\/main>\s*<script id="dynamic-toc-script">/.test(html) && !/<\/main>\s*<script>/.test(html)) {
    html = html.replace(/<\/body>/, '  </main>\n</body>');
}

html = html.replace(/<\/div>\s*<!-- ==================== MODULE/g, '</section>\n\n  <!-- ==================== MODULE');

if (/<\/div>\s*<\/main>/.test(html)) {
    html = html.replace(/<\/div>\s*<\/main>/, '</section>\n  </main>');
}

// Ensure Module Titles have the correct class and sections have IDs
let moduleCounter = 1;
html = html.replace(/<section class="avoid-break">/g, () => {
    return `<section class="avoid-break" id="module-${moduleCounter++}">`;
});

html = html.replace(/<h1>(\s*<svg[\s\S]*?<\/svg>\s*)Module \d+:/g, '<h1 class="module-title">$1Module ' + 'X:');
// Fix the replace above to keep the actual module number
moduleCounter = 1;
html = html.replace(/<h1(?: class="module-title")?>(\s*<svg[\s\S]*?<\/svg>\s*)Module \d+:/g, (match, p1) => {
    return `<h1 class="module-title">${p1}Module ${moduleCounter++}:`;
});


// 3. Dynamic TOC (Idempotent)
// Remove existing injected script if present
html = html.replace(/<script(?:\s+id="dynamic-toc-script")?>[\s\S]*?document\.querySelector\('\.toc-grid'\)[\s\S]*?<\/script>\s*/, '');

const tocScript = `
  <script id="dynamic-toc-script">
    document.addEventListener('DOMContentLoaded', () => {
      const grid = document.querySelector('.toc-grid');
      if (grid) {
        grid.innerHTML = '';
        document.querySelectorAll('.module-title').forEach((h1, index) => {
          const title = h1.textContent.trim();
          const moduleId = index + 1;
          const el = document.createElement('a');
          el.href = '#module-' + moduleId;
          el.className = 'toc-link';
          el.innerHTML = '<span><strong>Module ' + moduleId + ':</strong> ' + title.replace(/Module\\s*\\d+:/i, '').trim() + '</span> <span style="font-size:11px; color:var(--primary); font-weight:700;">(Jump)</span>';
          grid.appendChild(el);
        });
      }
    });
  </script>
</body>`;

html = html.replace('</body>', tocScript);

fs.writeFileSync('training_manual.html', html);
console.log('Processed HTML successfully');
