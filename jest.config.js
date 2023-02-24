module.exports = {
  displayName: 'UI Performance',
  "preset": "jest-puppeteer",
  testMatch: ['<rootDir>/tests/**//*.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverage: false, // Indicates whether the coverage information should be collected while executing the test
  testEnvironment: 'node', // The test environment that will be used for testing
}
