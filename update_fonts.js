const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
let changedFiles = [];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // JSX inline styles
      content = content.replace(/fontSize:\s*['"]11px['"]/g, "fontSize: '14px'");
      content = content.replace(/fontSize:\s*['"]12px['"]/g, "fontSize: '15px'");
      content = content.replace(/fontSize:\s*['"]13px['"]/g, "fontSize: '15px'");
      content = content.replace(/fontSize:\s*['"]14px['"]/g, "fontSize: '16px'");
      
      // CSS styles
      content = content.replace(/font-size:\s*11px/g, "font-size: 14px");
      content = content.replace(/font-size:\s*12px/g, "font-size: 15px");
      content = content.replace(/font-size:\s*13px/g, "font-size: 15px");
      content = content.replace(/font-size:\s*14px/g, "font-size: 16px");

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        changedFiles.push(fullPath);
      }
    }
  }
}

processDir(srcDir);
fs.writeFileSync('font_change_log.txt', changedFiles.join('\n'), 'utf8');
console.log(`Updated ${changedFiles.length} files.`);
