// eslint.config.js
const globals = require('globals');
const nodePlugin = require('eslint-plugin-node');
const securityPlugin = require('eslint-plugin-security');
const esxPlugin = require('eslint-plugin-es-x');
const cypressPlugin = require('eslint-plugin-cypress');

module.exports = [
    // 0. Глобально игнорируем все, что точно не JavaScript или не должно линтиться
    {
        ignores: [
            'node_modules/**',
            'coverage/**',
            'cypress/screenshots/**',
            'cypress/videos/**',
            'cypress/fixtures/**/*.json',
            'uploads/**',
            'avatars/**',
            'public/**/*.html',
            'public/**/*.css',
            '.env',
            '.gitignore',
            '*.json',
            'package.json',// Игнорирует все JSON файлы, включая package.json и фикстуры
            '*.md',
            '**/*.jpg',
            '**/*.ico',
            '**/*.png',
            '**/*.json',
            '.github/workflows/*.yml',
            'allure-results/**',
            'allure-report/**',
            'eslint.config.js', // Сам файл конфигурации тоже игнорируем от всех правил по умолчанию
        ],
    },

    // 1. Конфигурация для серверного JavaScript кода
    {
        files: [ // Применяем к файлам, которые НЕ БЫЛИ исключены глобально и НЕ будут обработаны другими блоками
            '*.js',             // Файлы .js в корне (server.js, jest.config.js и т.д.)
            'routes/**/*.js',
            'services/**/*.js',
            'models/**/*.js',
            'utils/**/*.js',
            'tests/**/*.js',    // Для Jest тестов
            // Исключаем то, что будет обработано другими, более специфичными блоками:
            '!public/**/*.js',
            '!cypress/**/*.js',
            '!cypress.config.js',
        ],
        // Убрали excludedFiles отсюда
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: { ...globals.node, ...globals.jest },
        },
        plugins: { node: nodePlugin, security: securityPlugin, 'es-x': esxPlugin },
        rules: {
            // ... (правила для серверного кода остаются такими же, как в предыдущем ответе) ...
            ...nodePlugin.configs.recommended.rules,
            ...securityPlugin.configs.recommended.rules,
            'indent': ['warn', 4, { 'SwitchCase': 1 }],
            'linebreak-style': ['warn', 'unix'],
            'quotes': ['warn', 'single'],
            'semi': ['warn', 'always'],
            'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'node/no-unpublished-require': 'off',
            'node/no-process-exit': 'off',
            'node/shebang': 'off',
            'node/no-exports-assign': 'off',
            'node/no-deprecated-api': 'off',
            'node/no-extraneous-require': 'off',
            'node/no-missing-require': 'off',
            'node/no-unsupported-features/es-builtins': 'off',
            'node/no-unsupported-features/es-syntax': 'off',
            'node/no-unsupported-features/node-builtins': 'off',
        },
    },

    // 2. Конфигурация для фронтенд-кода в public/ (только .js файлы)
    {
        files: ['public/**/*.js'],
        languageOptions: {
            sourceType: 'script',
            ecmaVersion: 'latest',
            globals: { ...globals.browser }
        },
        plugins: { security: securityPlugin, 'es-x': esxPlugin },
        rules: {
            ...securityPlugin.configs.recommended.rules,
            ...Object.fromEntries(Object.keys(nodePlugin.configs.recommended.rules).map(key => [key, 'off'])),
        }
    },

    // 3. Конфигурация для файлов тестов Cypress и cypress.config.js
    {
        // Этот блок должен идти после основного блока для .js, чтобы переопределить для Cypress файлов,
        // или убедиться, что основной блок их исключает.
        files: ['cypress/**/*.js', 'cypress.config.js'],
        plugins: { cypress: cypressPlugin },
        languageOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
            globals: { ...globals.node, ...globals.mocha, 'cy': 'readonly', 'Cypress': 'readonly' }
        },
        rules: {
            ...cypressPlugin.configs.recommended.rules,
            ...Object.fromEntries(Object.keys(nodePlugin.configs.recommended.rules).map(key => [key, 'off'])),
            'security/detect-non-literal-fs-filename': 'off',
        }
    },

    // Отдельный блок для eslint.config.js больше не нужен, так как он добавлен в глобальные ignores.
    // Если вы хотите его все же линтить (например, базовыми правилами ESLint), то нужно убрать
    // 'eslint.config.js' из глобальных ignores и создать для него отдельный блок без nodePlugin.
    // Но проще его просто игнорировать.
];