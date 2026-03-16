const fs = require('fs');
let content = fs.readFileSync('LoginForm.tsx', 'utf8');

const replacements = [
    { search: 'icon=\"⚧\"', replace: 'icon={<FiUser />}' },
    { search: 'icon=\"🆔\"', replace: 'icon={<FiCreditCard />}' },
    { search: 'icon=\"🗺️\"', replace: 'icon={<FiMap />}' },
    { search: 'icon=\"🏙️\"', replace: 'icon={<FiHome />}' },
    { search: 'icon=\"🏡\"', replace: 'icon={<FiHome />}' }
];

// Add FiCalendar, FiBriefcase, FiPhone if they are used but we removed them
content = content.replace(
    "import { FiEye, FiEyeOff, FiCheck, FiCircle, FiCamera, FiAlertTriangle, FiCreditCard, FiUser, FiMail, FiHome, FiMapPin, FiMap, FiLock } from 'react-icons/fi';",
    "import { FiEye, FiEyeOff, FiCheck, FiCircle, FiCamera, FiAlertTriangle, FiCreditCard, FiUser, FiCalendar, FiMail, FiHome, FiMapPin, FiMap, FiLock } from 'react-icons/fi';"
);

for (const rep of replacements) {
    if (content.includes(rep.search)) {
        content = content.split(rep.search).join(rep.replace);
    }
}

fs.writeFileSync('LoginForm.tsx', content, 'utf8');
