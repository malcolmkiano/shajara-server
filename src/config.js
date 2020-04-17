const { PORT, NODE_ENV, DATABASE_URL, TEST_DATABASE_URL } = process.env;

module.exports = {
  PORT: PORT || 8000,
  NODE_ENV,
  DATABASE_URL,
  TEST_DATABASE_URL
};