// jest.config.js
const os = require('os'); // Если будете добавлять environmentInfo от Jest

module.exports = {
    // 1. Используем специальное окружение Allure для Node.js
    // Это должно автоматически настроить и репортер, и setup для Allure.
    testEnvironment: 'allure-jest/node',

    // 2. Опции для окружения Allure Jest
    testEnvironmentOptions: {
        resultsDir: 'allure-results', // Директория для JSON/XML результатов Allure от Jest

        // Раскомментируйте и настройте, если хотите, чтобы Jest добавлял эту информацию в environment.xml/properties
        environmentInfo: { 
            'Jest_Node.js': process.version,
            'Jest_OS_Type': os.type(),
            'Jest_OS_Platform': os.platform(),
        },
    },

    // 3. Корень вашего проекта
    rootDir: '.',

    // 4. moduleNameMapper для использования псевдонимов в require/import
    // Это нужно, чтобы Jest понимал пути типа '@models/User'
    moduleNameMapper: {
        '^@models/(.*)$': '<rootDir>/models/$1',
        '^@services/(.*)$': '<rootDir>/services/$1',
        '^@utils/(.*)$': '<rootDir>/utils/$1',
        // Добавьте другие псевдонимы, если они используются
    },

    // 5. Секция reporters БОЛЬШЕ НЕ НУЖНА для Allure, если используется testEnvironment: "allure-jest/node"
    // Jest автоматически использует репортер, предоставляемый этим окружением.
    // Оставляем 'default', если хотим видеть стандартный вывод Jest в консоли в дополнение к Allure.
    reporters: ['default'],

    // 6. setupFilesAfterEnv БОЛЬШЕ НЕ НУЖНА для Allure, если используется testEnvironment: "allure-jest/node"
    // Окружение само выполнит необходимый setup.
    // setupFilesAfterEnv: [], 
};