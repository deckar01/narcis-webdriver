var NarcisWebdriver = require('./src/narcis-webdriver');
var NarcisHttpsProtocol = require('./src/narcis-https-protocol');

NarcisWebdriver.registerProtocol('https', NarcisHttpsProtocol);

module.exports = NarcisWebdriver;
