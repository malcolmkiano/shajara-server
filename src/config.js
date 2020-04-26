module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/shajara',
  JWT_SECRET: process.env.JWT_SECRET || '3b98fcaa-f5ff-49e7-9e67-c8dcf3ce33dc',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'e738c8a6-4fc9-45fd-8edb-5084da38e1be',
  
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};