const fs = require('fs');
const path = require('path');

const replacements = {
  '#C4612A': '#1e3a5f', // terracotta -> navy
  '#E8A838': '#3b82f6', // amber -> blue-500
  '#8B4513': '#1e40af', // accent -> deep blue
  '#100A04': '#020617', // hero-dark -> slate-950
  '#1C1108': '#0f172a', // hero-dark-2 -> slate-900
  '196,97,42': '30,58,95',
  '232,168,56': '59,130,246',
  '139,69,19': '15,23,42' // #8B4513 in rgb
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.push('./tailwind.config.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [oldVal, newVal] of Object.entries(replacements)) {
    const regex = new RegExp(oldVal, 'gi');
    if (regex.test(content)) {
      content = content.replace(regex, newVal);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
