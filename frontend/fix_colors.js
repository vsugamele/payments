const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        filelist = walkSync(dir + '/' + file, filelist);
      }
    } else {
      if (file.endsWith('.tsx') && file !== 'layout.tsx' && file !== 'Navbar.tsx') {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const files = walkSync('c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/frontend');
let totalReplaced = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace background: '#030711' or '#0a0f1a' with tailwind classes
  content = content.replace(/style=\{\{\s*background:\s*['"]#(030711|0a0f1a)['"]\s*,?\s*paddingBottom:[^}]+}}/g, 'className="bg-background pb-24"');
  content = content.replace(/style=\{\{\s*background:\s*['"]#(030711|0a0f1a)['"]\s*,?\s*minHeight:[^}]+}}/g, 'className="bg-background min-h-screen"');
  
  // Replace direct style={{ color: "#..."" }} logic
  const matchColor = (hex, cssVar) => {
    const rx = new RegExp(`color:\\s*['"]${hex}['"]`, 'gi');
    content = content.replace(rx, `color: "var(${cssVar})"`);
  };

  matchColor('#64748b', '--muted-foreground');
  matchColor('#475569', '--muted-foreground');
  matchColor('#334155', '--border');
  matchColor('#94a3b8', '--muted-foreground');
  matchColor('#f1f5f9', '--foreground');
  matchColor('#e2e8f0', '--foreground');
  matchColor('#3b82f6', '--primary');
  matchColor('#60a5fa', '--code-text');
  
  // Custom borders
  content = content.replace(/borderTop:\s*['"]1px solid #0f172a['"]/g, 'borderTop: "1px solid var(--border)"');
  content = content.replace(/borderTop:\s*['"]1px solid #1e293b['"]/g, 'borderTop: "1px solid var(--border)"');

  // Background replacements 
  content = content.replace(/background:\s*['"]#1e293b['"]/g, 'background: "var(--input)"');
  content = content.replace(/background:\s*['"]#0a1120['"]/g, 'background: "var(--code-bg)"');
  content = content.replace(/background:\s*['"]rgba\(255,255,255,0\.02\)['"]/g, 'background: "var(--muted)"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    totalReplaced++;
    console.log('Updated ' + file);
  }
}
console.log('Total files updated:', totalReplaced);
