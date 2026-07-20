const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFontSize(dir, sizes = {}) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findFontSize(fullPath, sizes);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const regex = /font-?size:\s*['"]?(\d+)px['"]?/gi;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const size = match[1];
        sizes[size] = (sizes[size] || 0) + 1;
      }
    }
  }
  return sizes;
}

const sizes = findFontSize(srcDir);
console.log(sizes);
