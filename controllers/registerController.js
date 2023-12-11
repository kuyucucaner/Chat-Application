const { check, validationResult } = require('express-validator');
const registerModel = require('../models/registerModel');
const existModel = require('../models/existModel');

const registerController = {
    RegisterUserController: [
        check('email')
            .isEmail()
            .withMessage('Invalid email format.')
            .custom(async (value) => {
                const isEmailExists = await existModel.checkEmailExistence(value);
                if (isEmailExists) {
                    throw new Error('E-mail already in use');
                }
            }),
        check('userName')
            .custom(async (value) => {
                const isUserNameExist = await existModel.checkUserNameExistence(value);
                if (isUserNameExist) {
                    throw new Error('User Name already in use');
                }
            })
            .withMessage('User Name must be unique.'),

        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
        check('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),

        async function (req, res) {
            // Hataları kontrol et
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(error => error.msg);
                const errorMessage = errorMessages.join(' ');

                const alertScript = `
                  <script>
                    alert('${errorMessage}');
                    window.location.href = '/register';
                  </script>
                `;

                return res.send(alertScript);
            }

            try {
                await registerModel.registerUser(req.body);
                console.log('Kullanıcı : ', req.body);
                const successMessage = 'Kullanıcı başarıyla kaydedildi!';

                const successScript = `
                    <script>
                        alert('${successMessage}');
                        window.location.href = '/';
                    </script>
                `;

                res.send(successScript);
            } catch (error) {
                const errorMessage = 'Kullanıcı kayıt Hatası!';

                const errorScript = `
                  <script>
                    alert('${errorMessage}');
                    window.location.href = '/register';
                  </script>
                `;

                res.status(500).send(errorScript);
            }
        }
    ],
};

module.exports = registerController;
