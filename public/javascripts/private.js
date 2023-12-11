const socket = io('http://localhost:8080');

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

  console.log('username', username);

  // Eğer username çerezi bulunduysa, değeri kullan
  if (username) {
    console.log('Username:', username);

    // Detaylı log fonksiyonu
    function logDetails(message) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] ${message}`);
    }

    // Diğer kodları buraya ekleyin...

    socket.emit('set username', username);
    logDetails(`Kullanıcı adı ayarlandı: ${username}`);
    socket.on('newPrivateMessage', (message) => {
      console.log('Yeni özel mesaj:', message);
  
      // Özel mesajın göndereni ve mesajı
      const fromUsername = message.from;
      const privateMessage = message.message;
  
      // Mesajları görüntülemek için bir div alanı
      const messagesContainer = document.getElementById('messages-container');
  
      // Bir ul (unordered list) elementi oluşturun
      const ul = document.getElementById('messages');
  
      // Bir li (list item) elementi oluşturun
      const li = document.createElement('li');
  
      // Oluşturulan li elementine içerik ekleyin
      li.textContent = `${fromUsername} (Özel): ${privateMessage}`;
    // Mesajın size ait olup olmadığını kontrol edin
    if (fromUsername === username) {
      li.classList.add('message', 'my-message');
    } else {
      li.classList.add('message', 'other-message');
    }
      // Li elementini ul içine ekleyin
      ul.appendChild(li);
  
      // Mesajlar alanını en sona kaydırın
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  
    document.getElementById('private-form').addEventListener('submit', function (e) {
      e.preventDefault();
      sendPrivateMessage();
    });
    // Diğer kodlar devam eder...
  } else {
    console.log('Username çerezi bulunamadı.');
  }
});
function sendPrivateMessage() {
  const toUsername = document.getElementById('to-username').value;
  const message = document.getElementById('private-m').value;

  if (toUsername.trim() !== '' && message.trim() !== '') {
    const privateMsg = { to: toUsername, message: message };
    socket.emit('privateMessage', privateMsg);
    console.log(`Özel mesaj gönderildi: ${toUsername}: ${message}`);
    document.getElementById('private-m').value = '';
  }
}
