// jest.config.js
module.exports = {
    // testEnvironment: 'node', // Стандартный Jest testEnvironment теперь не нужен здесь напрямую
    rootDir: '.',

    // Указываем специальное окружение Allure для Node.js
    testEnvironment: 'allure-jest/node',

    // Опции для окружения Allure Jest
    testEnvironmentOptions: {
        resultsDir: 'allure-results', // Директория для JSON/XML результатов Allure
        // Сюда можно добавить другие опции, специфичные для allure-jest, если они описаны в документации
        // Например, для добавления информации об окружении в отчет:
        // environmentInfo: {
        //   os_platform: require('os').platform(),
        //   node_version: process.version,
        // },
    },
    moduleNameMapper: {
        '^@models/(.*)$': '<rootDir>/models/$1',
        '^@services/(.*)$': '<rootDir>/services/$1',
        '^@utils/(.*)$': '<rootDir>/utils/$1',
    },
    // Секция reporters теперь не нужна для allure-jest, так как он сам себя регистрирует через testEnvironment
    // reporters: [
    //     'default',
    //     // ...
    // ],

    // setupFilesAfterEnv также не нужен для allure-jest, если используется testEnvironment allure-jest/node
    // setupFilesAfterEnv: [], 

    // moduleNameMapper: { ... }, // Оставьте, если вы используете псевдонимы для путей в require/import
};