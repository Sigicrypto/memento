const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;
walkDir(path.join(__dirname, '../app'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Remove "bg-black" and "text-white" from className strings
    // E.g., `className="min-h-screen bg-black text-white ..."` -> `className="min-h-screen ..."`
    // Also handle `bg-[#0a0e1a]` and `bg-[#0d1117]/40` if they appear in wrapper divs? 
    // Actually, let's just replace exact strings we want to drop from wrappers.
    
    content = content.replace(/className=(["'{`])([^"'{`]*?)\b(bg-black|text-white)\b(.*?(["'}]))/g, (match, p1, p2, p3, p4) => {
      let rest = p2 + p4;
      rest = rest.replace(/\b(bg-black|text-white)\b/g, ''); // in case both are there
      rest = rest.replace(/\s+/g, ' ').trim();
      return `className=${p1}${rest}`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log('Fixed:', filePath);
    }
  }
});

console.log(`Modified ${modifiedCount} files.`);
