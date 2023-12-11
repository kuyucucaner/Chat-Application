const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// ACCES VE REFRESH TOKEN
const authService = {
  authenticateToken: (req, res, next) => {
    // const accessToken = req.headers['authorization']?.replace('Bearer ', '')
    const accessToken = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;
    // console.log('accessToken : ' , accessToken);
    // console.log('refreshToken : ' , refreshToken);
    if (!accessToken) {
      console.log('Yetkisiz İstek: Erişim anahtarı eksik');
      return res.status(401).render('error', { message: 'Yetkisiz: Erişim anahtarı eksik' });
    }

    jwt.verify(accessToken, process.env.JWT_ACCESSECRETKEY, (err, decodedUser) => {
      if (err) {
        // Eğer erişim anahtarı geçerli değilse, yenileme anahtarını kontrol et
        if (!refreshToken) {
          console.log('Yetkisiz İstek: Yenileme anahtarı eksik');
          return res.status(403).render('error', { message: 'Yasak: Yenileme anahtarı eksik' });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESHSECRETKEY, (err, decodedUser) => {
          if (err) {
            console.error('JWT Doğrulama Hatası (Yenileme Anahtarı):', err);
            return res.status(403).render('error', { message: 'Yasak: Geçersiz yenileme anahtarı', error: err.message });
          }

          // Eğer yenileme anahtarı geçerliyse, yeni bir erişim anahtarı oluştur ve kullanıcıya gönder
          const newAccessToken = jwt.sign({ userId: decodedUser.userId }, process.env.JWT_ACCESSECRETKEY, { expiresIn: '15min' });
          res.cookie('token', newAccessToken, { httpOnly: true, secure: true });
          req.user = decodedUser;
          next();
        });
      } else {
        // Eğer erişim anahtarı geçerliyse, devam et
        req.user = decodedUser;
        next();
      }
    });
  },
};

module.exports = authService;
