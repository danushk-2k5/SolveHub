const fs = require(`fs`);
const bcrypt = require(`bcryptjs`);
const h = fs.readFileSync(`db_hash.txt`,`utf8`).split(String.fromCharCode(10))[1].trim();
console.log(`h:`,h);
console.log(`len:`,h.length);
bcrypt.compare(`ramesh123`,h).then(r=>console.log(`ramesh123:`,r));
bcrypt.compare(`Ramesh123`,h).then(r=>console.log(`Ramesh123:`,r));
