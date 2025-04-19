const { defineConfig } = require("cypress");

module.exports = defineConfig({
    defaultCommandTimeout: 5000,
    pageLoadTimeout: 60000,
    e2e: {
        baseUrl: 'http://localhost:3001',
        viewportWidth: 1280,
        viewportHeight: 720,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
