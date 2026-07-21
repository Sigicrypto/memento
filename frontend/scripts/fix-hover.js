const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, '../app'), function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace `hover: ` with `hover:text-black dark:hover:text-white `
    content = content.replace(/hover:\s/g, 'hover:text-black dark:hover:text-white ');
    content = content.replace(/hover:"/g, 'hover:text-black dark:hover:text-white"');
    
    // Make backgrounds adaptive
    content = content.replace(/\bbg-white\/5\b/g, 'bg-black/5 dark:bg-white/5');
    content = content.replace(/\bbg-white\/10\b/g, 'bg-black/10 dark:bg-white/10');
    content = content.replace(/\bborder-white\/5\b/g, 'border-black/5 dark:border-white/5');
    content = content.replace(/\bborder-white\/10\b/g, 'border-black/10 dark:border-white/10');
    content = content.replace(/\bborder-white\/20\b/g, 'border-black/20 dark:border-white/20');

    // Fix some stray `text-white` if they were meant to be adaptive
    content = content.replace(/\btext-slate-300\b/g, 'text-slate-700 dark:text-slate-300');
    content = content.replace(/\btext-slate-400\b/g, 'text-slate-600 dark:text-slate-400');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
console.log('Fixed hovers and glass backgrounds');
