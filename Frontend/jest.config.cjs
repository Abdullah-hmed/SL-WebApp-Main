// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom', // Makes Jest act like a browser
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest', // Use Babel to process .js and .jsx files
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'], // Run this file before tests
  testMatch: ['<rootDir>/src/**/*.test.{js,jsx}'], // Look for .test.js/.test.jsx files in src
};
