let sfConfig = require('./support-firecloud/repo/jest.config.sf');

sfConfig.setupFilesAfterEnv = [
  './jest.setup.js'
];

module.exports = sfConfig;
