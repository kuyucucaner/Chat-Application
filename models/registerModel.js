const dbConfig = require('../dbConfig');
const mssql = require('mssql');
const bcrypt = require('bcrypt');


const Register = {
    registerUser : async function (user) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request()
            .input('firstName' , mssql.NVarChar , user.firstName)
            .input('lastName' , mssql.NVarChar , user.lastName)
            .input('userName' , mssql.NVarChar , user.userName)
            .input('password', mssql.NVarChar, hashedPassword)
            .input('email' , mssql.NVarChar , user.email)
            .query('INSERT INTO Users (FirstName , LastName , UserName , Password , Email ) VALUES (@firstName, @lastName ,@userName , @password , @email )');
        }
        catch(err){
            console.error('Error : ', err);
        }
    },    
}

module.exports = Register;