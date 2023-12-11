const connect = require('../dbConfig');
const sql = require('mssql');

const Exist = {
    checkEmailExistence: async function (email) {
        try {
            const pool = await sql.connect(connect);
            const queryResult = await pool
                .request()
                .input('email', sql.NVarChar, email)
                .query('SELECT COUNT(*) AS count FROM Users WHERE Email = @email');
    
            const userCount = queryResult.recordset[0].count;
            return userCount > 0;
        } catch (error) {
            console.error('E-posta varlığı kontrolü sırasında bir hata oluştu:', error);
        }
    },  
    checkUserNameExistence: async function (username) {
        try {
            const pool = await sql.connect(connect);
            const queryResult = await pool
                .request()
                .input('userName', sql.NVarChar, username)
                .query('SELECT COUNT(*) AS count FROM Users WHERE UserName = @userName');
            const userCount = queryResult.recordset[0].count;
            return userCount > 0;
        } catch (error) {
            console.error('Username varlığı kontrolü sırasında bir hata oluştu:', error);
        }

    },  
};

module.exports = Exist;