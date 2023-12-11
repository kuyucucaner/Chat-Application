// dbconfig.js
const dotenv = require('dotenv');
dotenv.config();
const mssql = require('mssql');

const config = {
  server: process.env.DB_SERVERNAME,
  database: process.env.DB_NAME,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};
async function testConnection() {
    try {
      const pool = await new mssql.ConnectionPool(config).connect();
      console.log('Veritabanına başarıyla bağlandı!');
      pool.close();
    } catch (err) {
      console.error('Error connecting to MSSQL database:', err);
    }
  }
  
  testConnection();

module.exports = config;