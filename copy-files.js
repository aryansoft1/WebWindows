const fs = require('fs-extra');
const path = require('path');

const srcDir = path.resolve(__dirname, 'dist/JS');
const destDir = path.resolve(__dirname, 'assets/js');

fs.ensureDirSync(destDir);
fs.copySync(srcDir, destDir);

console.log('文件复制完成：', destDir);