const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dbConfig = require('../dbConfig');
const mssql = require('mssql');

const loginController = {
    login: async function (req, res) {
        try {
            const { userName, password } = req.body;
            console.log('Login Request:', { userName, password });
            const pool = await mssql.connect(dbConfig);
            const request = pool.request();
            const result = await request
                .input('userName', mssql.NVarChar, userName)
                .query('SELECT * FROM Users WHERE UserName = @userName');
            if (result.recordset.length === 0) {
                console.log('Geçersiz Kullanıcı Adı :', userName);
                const failScript = `
                <script>
                    alert('Invalid username');
                    window.location.href = '/';
                </script>
            `;
                return res.status(401).send(failScript);
            }
            const user = result.recordset[0];
            console.log('Kullanıcı Bilgileri :', user);
            if (!bcrypt.compareSync(password, user.Password)) {
                console.log('Kullanıcı İçin Geçersiz Şifre :', userName); 
                const failScript = `
                <script>
                    alert('Invalid password');
                    window.location.href = '/';
                </script>
            `;
                return res.status(401).send(failScript);
            }
            const accessToken = jwt.sign({ ID: user.ID, userName: user.UserName, isAdmin: user.IsAdmin , firstName : user.FirstName , lastName: user.LastName , email : user.Email}
                , process.env.JWT_ACCESSECRETKEY, { expiresIn: '10m' });
            const refreshToken = jwt.sign({ ID: user.ID, userName: user.UserName, isAdmin: user.IsAdmin , firstName : user.FirstName , lastName: user.LastName , email : user.Email}
                , process.env.JWT_REFRESHSECRETKEY, { expiresIn: '15m' });
            console.log('accessToken:', accessToken);
            console.log('refreshToken:', refreshToken);

            console.log("ID : ", user.ID + ' ' + "username : ", user.UserName);
            // res.header('Authorization', `Bearer ${accessToken}`).send(successScript);
            // const csrfToken = generateCsrfToken();
            // res.cookie('csrfToken', csrfToken, { httpOnly: true, secure: true });
            res.cookie('token', accessToken, { httpOnly: true, secure: true });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
            res.cookie('username', user.UserName, { httpOnly: false, secure: true });

            const successScript = `
                        <script>
                        alert('Login successful. Username: ${user.UserName}');
                        window.location.href = '/chat';
                    </script>
        `;
            res.send(successScript);
        } catch (error) {
            console.error('Login Error:', error);
            const errorScript = `
            <script>
            alert('Internal Server Error. Token: ${accessToken || 'N/A'}, Username: ${user.UserName || 'N/A'}');
            window.location.href = '/';
        </script>
            `;
            res.status(500).send(errorScript);
        }
    },
}



module.exports = loginController;