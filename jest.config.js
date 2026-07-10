// jest.config.js
module.exports = {
  type: 'module',
  testEnvironment: 'react',
  setupFilesAfterEnv: ['./src/setupTests.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};
