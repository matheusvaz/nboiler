module.exports = {
    preset: 'ts-jest',
    moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/src/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/test/'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/module.ts',
        '!src/main.ts',
        '!src/**/migrations/*.ts',
        '!src/**/repositories/*.ts',
        '!src/**/entities/*.ts',
        '!src/**/module.ts',
        '!src/shared/**/*.ts',
    ],
};
