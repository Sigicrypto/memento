const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace text-slate-400/300/etc that weren't caught or reverted
  content = content.replace(/\btext-slate-200\b/g, 'text-slate-800 dark:text-slate-200');
  content = content.replace(/\btext-slate-300\b/g, 'text-slate-700 dark:text-slate-300');
  content = content.replace(/\btext-slate-400\b/g, 'text-slate-600 dark:text-slate-400');
  content = content.replace(/\btext-gray-200\b/g, 'text-gray-800 dark:text-gray-200');
  content = content.replace(/\btext-gray-300\b/g, 'text-gray-700 dark:text-gray-300');
  content = content.replace(/\btext-gray-400\b/g, 'text-gray-600 dark:text-gray-400');
  content = content.replace(/\btext-zinc-200\b/g, 'text-zinc-800 dark:text-zinc-200');
  content = content.replace(/\btext-zinc-300\b/g, 'text-zinc-700 dark:text-zinc-300');
  content = content.replace(/\btext-zinc-400\b/g, 'text-zinc-600 dark:text-zinc-400');

  // For `text-white`, we want to replace it with `text-slate-900 dark:text-white` (or `text-black dark:text-white`)
  // BUT we don't want to replace it if it's in a string that contains `bg-primary`, `bg-blue`, `bg-red`, `bg-emerald`, `bg-indigo`, `bg-purple`
  // We can do this by regexing the entire className="..." string, parsing it, and replacing.
  
  const classNameRegex = /className=(?:\{`([^`]+)`\}|"([^"]+)")/g;
  content = content.replace(classNameRegex, (match, p1, p2) => {
    let cls = p1 || p2 || "";
    
    // Check if background implies we should keep text white
    const hasColoredBg = /(bg-primary|bg-red-|bg-blue-|bg-emerald-|bg-green-|bg-indigo-|bg-purple-|bg-amber-500)/.test(cls);
    
    if (!hasColoredBg) {
      // Replace text-white exactly
      cls = cls.replace(/\btext-white\b/g, 'text-black dark:text-white');
      // Replace text-white/XX
      cls = cls.replace(/\btext-white\/(\d+)\b/g, 'text-black/$1 dark:text-white/$1');
    }
    
    // Check for border-white/XX -> border-black/XX dark:border-white/XX
    cls = cls.replace(/\bborder-white\b/g, 'border-black/20 dark:border-white');
    cls = cls.replace(/\bborder-white\/(\d+)\b/g, 'border-black/10 dark:border-white/$1');
    
    if (p1) {
      return `className={\`${cls}\`}`;
    } else {
      return `className="${cls}"`;
    }
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, '../app'));
walkDir(path.join(__dirname, '../components'));
