module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/shajara',
  JWT_SECRET: process.env.JWT_SECRET || 'e4a94465-5b9a-4bf2-9d3d-1c0700a5fcb2',
  
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};