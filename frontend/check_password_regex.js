const regex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*[\s]).{8,}$/;

const examples = [
    'Password123!',
    'Password123-',
    'Password123_',
    'Password123+',
    'Password123=',
    'Password123<',
    'Password123>',
    'Password123;',
    'Password123:',
    'Password123.',
    'Password123,',
    'Password123"',
    "Password123'",
    'password123-',
    'Password123',
    'MyP@ssword1',
];

examples.forEach(pw => {
    console.log(`"${pw}": ${regex.test(pw)}`);
});
