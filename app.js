const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  path: '/socket.io',
  cors: {
    origin: "http://localhost:3000",  // Bu kısmı kendi frontend adresinize göre güncelleyin
    methods: ["GET", "POST"]
  }
});

// View engine ayarları
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware'ler
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io-client/dist')));
app.use(cors()); // Tüm alanlardan gelen isteklere izin verir

app.use('/', indexRouter);
app.use('/users', usersRouter);

const users = {};

// Socket.IO bağlantı olaylarını dinleyin
io.on('connection', (socket) => {
  console.log(`[${getCurrentTime()}] Yeni bir kullanıcı bağlandı. Socket ID: ${socket.id}`);
  
  socket.on('error', function (error) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] Socket.IO Hata: ${error.message}`);
    console.log(`[${timestamp}] İsteğin URL'si: ${error.request.url}`);
    console.log(`[${timestamp}] İsteğin metodu: ${error.request.method}`);
    console.log(`[${timestamp}] İsteğin yanıtı: ${error.response.statusCode}`);
  });

  // Kullanıcı adını kaydedin
  socket.on('set username', (username) => {
    console.log(`[${getCurrentTime()}] Kullanıcı adı ayarlandı: ${username}`);
    socket.username = username;
    users[socket.id] = { username: username, room: null }; // Kullanıcının hangi odada olduğunu takip etmek için
    io.emit('user connected', `[${getCurrentTime()}] ${username} sohbete katıldı`);
  });
  socket.on('privateMessage', (data) => {
    const senderUsername = socket.username;
    const receiverUsername = data.to;

    console.log(`[${getCurrentTime()}] Özel Mesaj Gönderen: ${senderUsername}`);
    console.log(`[${getCurrentTime()}] Özel Mesaj Alıcı: ${receiverUsername}`);
    // Alıcı kullanıcının bağlı olup olmadığını kontrol et
    const receiverSocket = findUserSocketByUsername(receiverUsername);
    
    if (receiverSocket) {
      console.log(`[${getCurrentTime()}] Alıcı Kullanıcı Bağlı: Evet`);

      // Alıcı kullanıcıya özel mesaj gönder
      receiverSocket.emit('newPrivateMessage', {
        from: senderUsername,
        message: data.message
      });
  
      // Gönderen kullanıcıya da bilgi ver (Opsiyonel)
      socket.emit('newPrivateMessage', {
        to: receiverUsername,
        from: senderUsername,
        message: data.message
      });
    } else {
      console.log(`[${getCurrentTime()}] Alıcı Kullanıcı Bağlı: Hayır`);
      // Alıcı kullanıcı bağlı değilse, hata mesajı gönder
      socket.emit('newPrivateMessage', {
        to: receiverUsername,
        from: 'System',
        message: 'Kullanıcı bağlı değil.'
      });
    }
  });
  
  // Mesajları dinleyin
  socket.on('chat message', (msg) => {
    console.log(`[${getCurrentTime()}] Mesaj alındı: ${msg}`);
    // Mesajı tüm kullanıcılara iletilmesi için broadcast kullanın
    io.emit('chat message', { username: socket.username, message: msg });
  });

  // Bağlantı kesildiğinde olayı dinleyin
  socket.on('disconnect', () => {
    console.log(`[${getCurrentTime()}] Bir kullanıcı ayrıldı. Socket ID: ${socket.id}`);
    // Kullanıcının odasını güncelle
    if (users[socket.id]) {
      const room = users[socket.id].room;
      if (room) {
        socket.leave(room);
      }
      delete users[socket.id];
    }
  });
});
function findUserSocketByUsername(username) {
  for (const socketId in users) {
    const user = users[socketId];
    if (user.username === username) {
      return io.to(socketId);
    }
  }
  return null;
}
// 404 hatası yönlendirmesi
app.use(function(req, res, next) {
  next(createError(404));
});

// Hata yönetimi
app.use(function(err, req, res, next) {
  console.error(`[${getCurrentTime()}] Hata: ${err.message}`);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

function getCurrentTime() {
  return new Date().toLocaleTimeString();
}

server.listen(8080, () => {
  console.log('Server is running on port 8080');
});
