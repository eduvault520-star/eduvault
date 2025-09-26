const mongoose = require('mongoose');

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key';
  process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/eduvault_test';
  
  // Suppress console logs during tests unless explicitly needed
  if (!process.env.VERBOSE_TESTS) {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

// Global test teardown
afterAll(async () => {
  // Close all mongoose connections
  await mongoose.disconnect();
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections if connected
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for async operations
jest.setTimeout(10000);
