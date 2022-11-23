export = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(ts|tsx)'],
  testPathIgnorePatterns: ['dist'],
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
  testTimeout: 5 * 60 * 1000,
};
