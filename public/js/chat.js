const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.querySelector('#room-name');

let room;

const chatRoomsBtn = document.querySelector('#chat-rooms');

let flag = false;
let isOpen = false;

let socket;



const notification = document.querySelector('#notification-count');
const joinChatBtn = document.querySelector('.joinBtn');

const chatModal = document.querySelector('.modal-chat');

const roomModal = document.querySelector('.modal-rooms');

const chatRoomBtn = document.querySelector('#chat-rooms');
const chatRoomBtn2 = document.querySelector('#chat-rooms-2');

chatRoomBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (!flag) roomModal.classList.toggle('hidden');
  else {
    chatSectionModal.classList.toggle('hidden');
    isOpen = true;
    notificationCount = 0;
    notification.classList.add('hidden');
    notification.innerHTML = '';
  }
});
chatRoomBtn2.addEventListener('click', (e) => {
  e.preventDefault();
  if (!flag) roomModal.classList.toggle('hidden');
  else {
    chatSectionModal.classList.toggle('hidden');
    isOpen = true;
    notificationCount = 0;
    notification.classList.add('hidden');
    notification.innerHTML = '';
  }
});

const chatBox = document.querySelector('.chatbox-open');
const chatSectionModal = document.querySelector('.chat-section-wrapper');

chatBox.addEventListener('click', (e) => {
  e.preventDefault();
  if (!flag) roomModal.classList.toggle('hidden');
  else {
    chatSectionModal.classList.toggle('hidden');
    isOpen = true;
    notificationCount = 0;
    notification.classList.add('hidden');
    notification.innerHTML = '';
  }
});

let notificationCount = 0;

const msgerForm = get('.msger-inputarea');
const msgerInput = get('.msger-input');
const msgerChat = get('.msger-chat');

msgerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const msgText = msgerInput.value;
  if (!msgText) return;

  socket.emit('chatMessage', msgText);

  msgerInput.value = '';
});

function appendMessage(name, user, side, msg) {
  //   Simple solution for small apps

  let msgHTML = `<div class="msg ${side}-msg">`;

  if (user.filename) {
    msgHTML += ` <img
            src="/dashboard/image/${user.filename}"
            
            class="msg-img"
          />`;
  } else {
    msgHTML += `<img
          src="../public/img/default.png"
          class="msg-img"
          
        />`;
  }

  msgHTML += `<div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${msg.time}</div>
        </div>

        <div class="msg-text">${msg.text}</div>
      </div>
    </div> `;

  msgerChat.insertAdjacentHTML('beforeend', msgHTML);
  msgerChat.scrollTop += 500;

  if (!isOpen) {
    notificationCount++;
    notification.classList.remove('hidden');
    if (notificationCount <= 9) {
      notification.classList.remove('hidden');
      notification.innerHTML = notificationCount;
    } else {
      notification.innerHTML = '9+';
    }
  }
}

// Utils
function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = '0' + date.getHours();
  const m = '0' + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}

const optionViewButton = document.querySelector('#options-view-button');
const options = document.querySelectorAll('.my-option');
const roomname = document.querySelector('.room-name');
const leaveBtn = document.querySelector('.leave-btn');

leaveBtn.addEventListener('click', (e) => {
  socket.disconnect();
  flag = false;
  chatSectionModal.classList.toggle('hidden');
  roomModal.classList.toggle('hidden');
});
let selectedValue;
joinChatBtn.addEventListener('click', async (e) => {
  if (!selectedValue) return;
  flag = true;
  isOpen = true;
  roomname.innerHTML = selectedValue;
  e.preventDefault();

  roomModal.classList.toggle('hidden');
  chatSectionModal.classList.toggle('hidden');

  room = selectedValue;
  let allUsers = await fetch('/dashboard/data', {
    method: 'GET',
  }).then((res) => res.json());

  document.querySelector('.msger-chat').innerHTML = '';

  let history = await fetch('/dashboard/chat/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      room: room,
    }),
  }).then((res) => res.json());

  let currentUser = await fetch('/dashboard/data/me').then((res) => res.json());

  socket = io();

  socket.emit('joinRoom', { id: currentUser.user._id, room });

  history.chat.forEach((msg) => {
    let user = allUsers.users.filter((user) => user._id === msg.id);
    const side = currentUser.user._id == user[0]._id ? 'right' : 'left';
    appendMessage(user[0].name, user[0], side, msg);
  });

  socket.on('message', (message) => {
    let user = allUsers.users.filter((user) => user._id === message.id);
    const side = currentUser.user._id == user[0]._id ? 'right' : 'left';

    appendMessage(user[0].name, user[0], side, message);
  });
});

options.forEach((option) => {
  option.addEventListener('click', (e) => {
    selectedValue = e.target.value;
  });
});
