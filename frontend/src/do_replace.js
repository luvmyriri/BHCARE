const fs = require('fs');

let content = fs.readFileSync('LoginForm.tsx', 'utf8');

const replacements = [
    { search: 'icon=\"🪪\"', replace: 'icon={<FiCreditCard />}' },
    { search: 'icon=\"👤\"', replace: 'icon={<FiUser />}' },
    { search: 'icon=\"📅\"', replace: 'icon={<FiCalendar />}' },
    { search: 'icon=\"⚧️\"', replace: 'icon={<FiUser />}' },
    { search: 'icon=\"🏢\"', replace: 'icon={<FiBriefcase />}' },
    { search: 'icon=\"📞\"', replace: 'icon={<FiPhone />}' },
    { search: 'icon=\"✉️\"', replace: 'icon={<FiMail />}' },
    { search: 'icon=\"🏠\"', replace: 'icon={<FiHome />}' },
    { search: 'icon=\"📮\"', replace: 'icon={<FiMapPin />}' },
    { search: 'icon=\"📍\"', replace: 'icon={<FiMapPin />}' },
    { search: 'icon=\"🛣️\"', replace: 'icon={<FiMap />}' },
    { search: 'icon=\"🏘️\"', replace: 'icon={<FiHome />}' },
    { search: '<span style={{ fontSize: \'16px\', marginRight: \'8px\' }}>🔒</span>', replace: '<span style={{ fontSize: \'16px\', marginRight: \'8px\' }}><FiLock /></span>' },
    { search: '<span style={{ fontSize: \'16px\', marginRight: \'8px\' }}>👤</span>', replace: '<span style={{ fontSize: \'16px\', marginRight: \'8px\' }}><FiUser /></span>' },
    { search: '<span style={{ fontSize: \'16px\', marginRight: \'8px\' }}>✉️</span>', replace: '<span style={{ fontSize: \'16px\', marginRight: \'8px\' }}><FiMail /></span>' }
];

if (!content.includes('FiCreditCard')) {
    content = content.replace(
        "import { FiEye, FiEyeOff, FiCheck, FiCircle, FiCamera, FiAlertTriangle } from 'react-icons/fi';",
        "import { FiEye, FiEyeOff, FiCheck, FiCircle, FiCamera, FiAlertTriangle, FiCreditCard, FiUser, FiCalendar, FiBriefcase, FiPhone, FiMail, FiHome, FiMapPin, FiMap, FiLock } from 'react-icons/fi';"
    );
}

for (const rep of replacements) {
    if (content.includes(rep.search)) {
        content = content.split(rep.search).join(rep.replace);
    }
}

fs.writeFileSync('LoginForm.tsx', content, 'utf8');
console.log('Replaced correctly!');
