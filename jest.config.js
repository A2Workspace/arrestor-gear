const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./test/tsconfig');

module.exports = {
  verbose: true,
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/test/test-utils.ts'],
  coverageReporters: ['clover', 'text-summary', 'json', 'html'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: './test/tsconfig.json',
    },
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src/' }),
};
