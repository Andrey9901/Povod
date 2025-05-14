const os = require('os');

module.exports = {
    // Используем специальное окружение Allure для Node.js
    testEnvironment: 'allure-jest/node',

    // Опции для окружения Allure Jest
    testEnvironmentOptions: {
        resultsDir: 'allure-results',
        environmentInfo: { 
            'Jest_Node.js': process.version,
            'Jest_OS_Type': os.type(),
            'Jest_OS_Platform': os.platform(),
        },
    },
    rootDir: '.',

    // moduleNameMapper для использования псевдонимов в require/import
    // Это нужно, чтобы Jest понимал пути типа '@models/User'
    moduleNameMapper: {
        '^@models/(.*)$': '<rootDir>/models/$1',
        '^@services/(.*)$': '<rootDir>/services/$1',
        '^@utils/(.*)$': '<rootDir>/utils/$1',
    },
    reporters: ['default'],
};