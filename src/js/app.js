class App {
  constructor() {
    this.chatContainer = document.querySelector('.chat-container');
    this.chat = document.querySelector('.chat');

    this.messageForm = document.querySelector('.message-form');
    this.messageInput = document.querySelector('.message-input');

    this.loginContainer = document.querySelector('.login-container');
    this.loginForm = document.querySelector('.login-form');
    this.loginInput = document.querySelector('.login-input');
    this.loginLabel = document.querySelector('.login-label');

    this.usersListContainer = document.querySelector('.users');
    this.usersList = document.querySelector('.users-list');

    // this.url = 'ws://localhost:7070/ws';
    this.url = 'wss://lazyferret-ahj-ws-backend.herokuapp.com/';
    this.user = null;
  }

  init() {
    this.wsConnect();
    this.messageForm.addEventListener('submit', (e) => this.sendMessage(e));
    this.loginForm.addEventListener('submit', (e) => this.login(e));
  }

  login(e) {
    e.preventDefault();
    this.user = this.loginInput.value;
    this.ws.send(JSON.stringify({ login: this.loginInput.value }));
    this.loginInput.value = '';
    this.getChat();
  }

  drawUsers(user) {
    this.usersList.innerHTML += `
        <li>${user}</li>
      `;
  }

  changeName() {
    this.loginLabel.style.color = 'red';
    this.loginInput.classList.add('invalid');
    this.loginLabel.innerHTML = 'Ooops! Guess you should choose another nick';
  }

  nameChecked() {
    this.loginContainer.classList.add('hidden');
    this.loginLabel.style.color = 'inherit';
    this.loginInput.classList.remove('invalid');
    this.loginLabel.innerHTML = 'Type your nick here';
  }

  drawMessagesList(nick, msg, date, user) {
    let classname = '';
    let login = nick;
    if (nick === user) {
      classname = ' you';
      login = 'You';
    }
    this.chat.innerHTML += `
      <div class="message${classname}">
      <span>${login}, ${date}</span>
      ${msg}
      </div>
      `;
  }

  sendMessage(e) {
    e.preventDefault();
    this.ws.send(JSON.stringify({ message: this.messageInput.value }));
    this.messageInput.value = '';
  }

  getChat() {
    this.ws.send(JSON.stringify({ messagesList: true }));
  }

  wsConnect() {
    this.ws = new WebSocket(this.url);
    const { ws } = this;
    ws.binaryType = 'blob';

    ws.addEventListener('open', () => {
      console.log('connection opened');
    });
    ws.addEventListener('close', () => {
      console.log('connection closed');
    });
    ws.addEventListener('message', (e) => {
      const response = JSON.parse(e.data);
      if (!response) this.changeName();
      else if (!response[0].msg) {
        this.usersListContainer.classList.remove('hidden');
        this.chatContainer.classList.remove('hidden');
        this.usersList.innerHTML = '';
        response.forEach((user) => {
          this.drawUsers(user.name);
        });
        this.nameChecked();
      } else if (response[0].msg) {
        this.chat.innerHTML = '';
        response.forEach((msg) => {
          this.drawMessagesList(msg.nickname, msg.msg, msg.date, this.user);
        });
      }
    });
  }
}

const app = new App();
app.init();
