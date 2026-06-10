const fs = require('fs');
let data = fs.readFileSync('firebase-db.js', 'utf8');
data = data.replace(/Z"/g, '"');
fs.writeFileSync('firebase-db.js', data);
console.log('Fixed dates in firebase-db.js');
