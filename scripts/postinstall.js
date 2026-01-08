const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serverPath = path.join(__dirname, '..', 'server');

if (fs.existsSync(serverPath)) {
  console.log('Installing server dependencies...');
  process.chdir(serverPath);
  execSync('npm install --only=production', { stdio: 'inherit' });
} else {
  console.log('Server directory not found, skipping server dependencies installation.');
}

