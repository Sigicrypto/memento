const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend');

const replacements = [
  { regex: /text-black dark:text-white/g, replacement: 'text-text-primary' },
  { regex: /hover:text-black dark:hover:text-black dark:text-white/g, replacement: 'hover:text-text-primary' },
  { regex: /hover:text-black dark:hover:text-white/g, replacement: 'hover:text-text-primary' },
  { regex: /text-slate-700 dark:text-slate-700 dark:text-slate-300/g, replacement: 'text-text-primary' },
  { regex: /text-slate-700 dark:text-slate-300/g, replacement: 'text-text-primary' },
  { regex: /text-slate-500/g, replacement: 'text-text-secondary' },
  { regex: /bg-black\/5 dark:bg-white\/5/g, replacement: 'bg-bg-subtle' },
  { regex: /hover:bg-black\/5 dark:hover:bg-white\/5/g, replacement: 'hover:bg-border' },
  { regex: /bg-black\/10 dark:bg-white\/10/g, replacement: 'bg-border' },
  { regex: /hover:bg-black\/10 dark:hover:bg-white\/10/g, replacement: 'hover:bg-border' },
  { regex: /border border-black\/10 dark:border-black\/20 dark:border-black\/10 dark:border-white\/10/g, replacement: 'border border-border' },
  { regex: /border-black\/20 dark:border-black\/10 dark:border-white\/10/g, replacement: 'border-border' },
  { regex: /border-black\/20 dark:border-white\/10/g, replacement: 'border-border' },
  { regex: /border-black\/10 dark:border-white\/10/g, replacement: 'border-border' },
  { regex: /border-black\/10 dark:border-black\/20 dark:border-white\/10/g, replacement: 'border-border' },
  { regex: /border-black\/10 dark:border-black\/20 dark:border-black\/10 dark:border-white\/10/g, replacement: 'border-border' },
  { regex: /dark:hover:text-black/g, replacement: 'hover:text-text-primary' },
  { regex: /text-black\/50 dark:text-white\/40/g, replacement: 'text-text-muted' },
  { regex: /bg-black\/5 dark:bg-\[#0f0f12\]\/70/g, replacement: 'bg-bg-subtle' },
  { regex: /shadow-black\/5 dark:shadow-none/g, replacement: 'shadow-sm' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.next')) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Replacement complete.');
