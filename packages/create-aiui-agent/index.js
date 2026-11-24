#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const targetDirName = process.argv[2];

if (!targetDirName) {
  console.error('Please specify the project directory:');
  console.error('  npx @yodaos-pkg/create-aiui-agent <project-directory>');
  process.exit(1);
}

const targetPath = path.join(process.cwd(), targetDirName);
const templatePath = path.join(__dirname, 'template');

if (fs.existsSync(targetPath)) {
  console.error(`Directory ${targetDirName} already exists.`);
  process.exit(1);
}

// Ensure the target directory exists
fs.mkdirSync(targetPath, { recursive: true });

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf-8');
      
      // Replace placeholders
      if (content.includes('{{PROJECT_NAME}}')) {
        content = content.replace(/\{\{PROJECT_NAME\}\}/g, path.basename(targetPath));
      }
      
      fs.writeFileSync(destPath, content, 'utf-8');
    }
  }
}

copyDir(templatePath, targetPath);

console.log(`\nSuccessfully created project ${targetDirName}`);
console.log('Get started with the following commands:\n');
console.log(`  cd ${targetDirName}`);
console.log(`  npm install`);
console.log(`  npm start\n`);
