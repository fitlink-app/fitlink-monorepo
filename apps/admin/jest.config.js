process.env.TZ = 'GMT'

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      // The contents of this file should be what @chrisgibbs44 shared above
      tsconfig: 'tsconfig.test.json',
      isolatedModules: true,
    },
  },
  moduleNameMapper: {
    '\\.(scss)$': '<rootDir>/src/tests/mock/styleMock.js'
  }
};
