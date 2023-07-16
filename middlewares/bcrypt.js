const bcrypt = require('bcryptjs');

const hash = async password => await bcrypt.hash(password, 10);

const compare = async (password, hashedPassword) => await bcrypt.compare(password, hashedPassword);

module.exports = {hash, compare};