// cypress.config.js
const { defineConfig } = require('cypress');
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Убедитесь, что путь к вашей Mongoose модели Product правильный
const allureWriter = require('@shelex/cypress-allure-plugin/writer');

let mongooseConnection = null;

async function connectToTestDB() {
    if (mongooseConnection && mongooseConnection.readyState === 1) {
        console.log('[CYPRESS TASK DB] MongoDB connection already established.');
        return mongooseConnection;
    }
    try {
        const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/povod_test';
        console.log(`[CYPRESS TASK DB] Connecting to TEST MongoDB: ${testMongoUri}`);
        await mongoose.connect(testMongoUri);
        mongooseConnection = mongoose.connection;
        console.log('[CYPRESS TASK DB] TEST MongoDB connected successfully.');
        return mongooseConnection;
    } catch (err) {
        console.error('[CYPRESS TASK DB] Failed to connect to TEST MongoDB:', err);
        mongooseConnection = null;
        throw err;
    }
}

async function disconnectFromTestDB() {
    if (mongooseConnection && mongooseConnection.readyState === 1) {
        try {
            await mongoose.disconnect();
            console.log('[CYPRESS TASK DB] TEST MongoDB disconnected successfully.');
        } catch (err) {
            console.error('[CYPRESS TASK DB] Error disconnecting from TEST MongoDB:', err);
        } finally {
            mongooseConnection = null;
        }
    } else {
        console.log('[CYPRESS TASK DB] No active MongoDB connection to disconnect.');
    }
}

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3001',
        setupNodeEvents(on, config) {
            allureWriter(on, config);
            on('task', {
                async dbConnect() {
                    await connectToTestDB();
                    return null;
                },
                async dbDisconnect() {
                    await disconnectFromTestDB();
                    return null;
                },
                async clearProducts() {
                    console.log('[CYPRESS TASK DB] Attempting to clear Products collection...');
                    await connectToTestDB();
                    try {
                        const deleteResult = await Product.deleteMany({});
                        console.log('[CYPRESS TASK DB] Products collection cleared. Deleted:', deleteResult.deletedCount);
                        return null;
                    } catch (err) {
                        console.error('[CYPRESS TASK DB] Error clearing products:', err);
                        throw err;
                    }
                },
                async seedProduct(productData) {
                    console.log('[CYPRESS TASK DB] Attempting to seed product with data:', productData);
                    await connectToTestDB();
                    try {
                        const dataToSeed = { ...productData, userId: productData.userId || 'task_default_user_id' };
                        const product = new Product(dataToSeed);
                        console.log('[CYPRESS TASK DB] Product instance created:', JSON.stringify(product.toObject()));
                        const savedProduct = await product.save();

                        if (savedProduct && savedProduct._id) {
                            console.log('[CYPRESS TASK DB] Product SEEDED successfully in DB, ID:', savedProduct._id.toString());
                            return JSON.parse(JSON.stringify(savedProduct));
                        } else {
                            console.error('[CYPRESS TASK DB] Product save operation did NOT return a valid product or _id. SavedProduct:', JSON.stringify(savedProduct));
                            throw new Error('Failed to save product or retrieve _id after save.');
                        }
                    } catch (err) {
                        console.error('[CYPRESS TASK DB] Error seeding product:', err);
                        throw err;
                    }
                },
                isObjectIdValid(id) {
                    if (id === null || typeof id === 'undefined') return false;
                    return mongoose.Types.ObjectId.isValid(id.toString());
                },
                generateValidObjectId() { // Новая задача
                    return new mongoose.Types.ObjectId().toString();
                }
            });

            // Если используете Allure, его настройка должна быть здесь
            // const allureWriter = require('@shelex/cypress-allure-plugin/writer');
            // allureWriter(on, config);

            return config;
        },
        env: {
            allure: true,
            allureResultsPath: 'allure-results',
            allureClearSkipped: true,
        }
    },
});