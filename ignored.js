const fs = require('fs')

const items = fs.readdirSync('src/public/references');
const IGNORED_FILES = items.map(item => `assets/references/${item}`)

console.log(ignored)