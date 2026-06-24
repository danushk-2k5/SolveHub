const bcrypt = require('bcryptjs');
const stored = '/XJugrUiNdVOSmG70f5nBvkh6';
console.log('Stored hash:', stored);
console.log('Stored chars:', stored.split('').map((c,i) => i+':'+c).join(' '));
