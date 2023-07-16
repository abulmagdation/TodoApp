const jwt = require('jsonwebtoken');

const sign = async data => await jwt.sign(data, process.env.PRIVATE_KEY);

const verify = async encrypted => await jwt.verify(encrypted, process.env.PRIVATE_KEY);

module.exports = {verify, sign};