import { join } from 'path';

export = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(ts|tsx)'],
  testPathIgnorePatterns: ['dist'],
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
  testTimeout: 45000,
  globalSetup: './src/__tests__/setup.js',
  globalTeardown: './src/__tests__/teardown.js',
};
