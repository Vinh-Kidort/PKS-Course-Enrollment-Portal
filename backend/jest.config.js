module.exports = {
  testEnvironment: 'node',
  globalSetup: '<rootDir>/tests/global-setup.js',
  setupFiles: ['<rootDir>/tests/load-env.js'],
  testTimeout: 20000,
  maxWorkers: 1, 
};