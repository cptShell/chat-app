const socket = io();
const form = document.querySelector('form');
const messageInput = form.querySelector('#input-message');
const messageBtn = form.querySelector('#send-message');
const locationBtn = document.getElementById('send-location');
const messages = document.getElementById('messages');
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

const { room, username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  const newMessage = messages.lastElementChild;
  newMessage.scrollIntoView();
};

socket.on('message', ({ text, createdAt, username }) => {
  const html = Mustache.render(messageTemplate, {
    username,
    text,
    createdAt: moment(createdAt).format('h:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', ({ url, createdAt, username }) => {
  const html = Mustache.render(locationTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format('h:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    users,
    room,
  });
  document.querySelector('.chat__sidebar').innerHTML = html;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
});

messageBtn.addEventListener('click', () => {
  socket.emit('message', messageInput.value, (error) => {
    console.log(error || 'Message delivered!');

    messageBtn.removeAttribute('disabled');
    messageInput.value = '';
    messageInput.focus();
  });

  messageBtn.setAttribute('disabled', 'disabled');
});

locationBtn.addEventListener('click', () => {
  const { geolocation } = navigator;

  if (!geolocation) {
    return alert('geolocation is not supported in your browser');
  }

  locationBtn.setAttribute('disabled', 'disabled');

  geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    socket.emit('sendLocation', { latitude, longitude }, (status) => {
      console.log(status);

      locationBtn.removeAttribute('disabled');
    });
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
