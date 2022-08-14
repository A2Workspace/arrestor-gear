const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./test/tsconfig');

module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: './test/tsconfig.json',
    },
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src/' }),
};
