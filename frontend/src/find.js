const fs = require('fs');
const content = fs.readFileSync('LoginForm.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('icon=') || line.includes('🔒') || line.includes('🪪') || line.includes('👤') || line.includes('✉️') || line.includes('🏠') || line.includes('📮') || line.includes('📍') || line.includes('🛣️') || line.includes('🏘️') || line.includes('⚧️') || line.includes('🏢') || line.includes('📞') || line.includes('📅')) {
    console.log(`${i + 1}|${line.trim()}`);
  }
}
