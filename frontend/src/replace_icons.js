const fs = require('fs');

let content = fs.readFileSync('LoginForm.tsx', 'utf8');

const replacements = {
    'icon="🪪"': 'icon={<FiCreditCard />}',
    'icon="👤"': 'icon={<FiUser />}',
    'icon="📅"': 'icon={<FiCalendar />}',
    'icon="⚧️"': 'icon={<FiUser />}',
    'icon="🏢"': 'icon={<FiBriefcase />}',
    'icon="📞"': 'icon={<FiPhone />}',
    'icon="✉️"': 'icon={<FiMail />}',
    'icon="🏠"': 'icon={<FiHome />}',
    'icon="📮"': 'icon={<FiMapPin />}',
    'icon="📍"': 'icon={<FiMapPin />}',
    'icon="🛣️"': 'icon={<FiMap />}',
    'icon="🏘️"': 'icon={<FiHome />}',
    '<span style={{ fontSize: \\'16px\\', marginRight: \\'8px\\' }}>🔒</span>': '<span style={{ fontSize: \\'16px\\', marginRight: \\'8px\\' }}><FiLock /></span>',
    '<span style={{ fontSize: \\'16px\\', marginRight: \\'8px\\' }}>👤</span>': '<span style={{ fontSize: \\'16px\\', marginRight: \\'8px\\' }}><FiUser /></span>',
    '<span style={{ fontSize: \\'16px\\', marginRight: \\'8px\\' }}>✉️</span>': '<span style={{ fontSize: \\'16px\\', marginRight: \\'8px\\' }}><FiMail /></span>',
};

// Also add to imports
if (!content.includes('FiCreditCard')) {
    content = content.replace(
        /import { FiEye, FiEyeOff, FiCheck, FiCircle, FiCamera, FiAlertTriangle } from 'react-icons\\/fi';/,
        "import { FiEye, FiEyeOff, FiCheck, FiCircle, FiCamera, FiAlertTriangle, FiCreditCard, FiUser, FiCalendar, FiBriefcase, FiPhone, FiMail, FiHome, FiMapPin, FiMap, FiLock } from 'react-icons/fi';"
    );
}

for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
}

fs.writeFileSync('LoginForm.tsx', content, 'utf8');
console.log('Replaced successfully');
