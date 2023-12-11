document.addEventListener('DOMContentLoaded', function () {
  // Tüm çerezleri al
  const allCookies = document.cookie;
  console.log('document.cookie:', document.cookie);

  // Çerezleri parçalara ayır
  const cookieArray = allCookies.split(';');

  // İstenen çerezi bul
  let username;
  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim();
    
    // Çerez adını ve değerini ayır
    const [cookieName, cookieValue] = cookie.split('=');

    // İstenen çerezi bul
    if (cookieName.trim() === 'username') {
      username = cookieValue;
      break;
    }
    
  }
console.log('username' , username);
  // Eğer username çerezi bulunduysa, değeri kullan
  if (username) {
    console.log('Username:', username);

    const socket = io('http://localhost:8080');
    
    // Detaylı log fonksiyonu
    function logDetails(message) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] ${message}`);
    }

    socket.on('error', function (error) {
      logDetails('Socket.IO Hata: ' + JSON.stringify(error));
    });

    document.getElementById('form').addEventListener('submit', function (e) {
      e.preventDefault();
      sendMessage();
    });

    function sendMessage() {
      var inputElement = document.getElementById('m');
      const message = document.getElementById('m').value;
      if (message.trim() !== '') {
        const msg = { username, message: message }; // mesaj nesnesi oluşturma
        socket.emit('chat message', msg); // msg değişkenini iletme
        document.getElementById('m').value = '';
        logDetails(`Mesaj gönderildi: ${message}`);
      }
      inputElement.focus();
    }
    

    socket.emit('set username', username);
    logDetails(`Kullanıcı adı ayarlandı: ${username}`);

    socket.on('connect', function () {
      logDetails('Sunucuya bağlandı');
    });

    socket.on('chat message', function (msg) {
      const messageText = msg.message.message; // Access the message property within the message object
      logDetails(`Mesaj alındı: ${msg.username}: ${messageText}`);
      console.log('Received message object:', msg);
      const messages = document.getElementById('messages');
      const li = document.createElement('li');
      li.textContent = `${msg.username}: ${messageText}`;
      messages.appendChild(li);
      const messagesContainer = document.getElementById('messages-container');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
    
    

    socket.on('user connected', function (notification) {
      logDetails(`Yeni kullanıcı bağlandı: ${notification}`);
      const messages = document.getElementById('messages');
      const li = document.createElement('li');
      li.className = 'notification';
      li.textContent = notification;
      messages.appendChild(li);
    });

    window.sendMessage = sendMessage;
  } else {
    console.log('Username çerezi bulunamadı.');
  }

  // Diğer kodlar devam eder...
});
