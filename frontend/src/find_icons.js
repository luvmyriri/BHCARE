const fs = require('fs');
const content = fs.readFileSync('LoginForm.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('icon=') || lines[i].includes('🔒') || lines[i].includes('🪪')) {
    console.log(`line ${i + 1}: ${lines[i].trim()}`);
  }
}
