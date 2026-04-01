const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });

let myVideoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
const userName = prompt("Enter your name") || "Anonymous";

navigator.mediaDevices.getUserMedia({
    video: true, audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => addVideoStream(video, userVideoStream));
    });

    socket.on('user-connected', (userId, name) => {
        connectToNewUser(userId, stream);
        addToParticipantsList(name, userId);
    });
});

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, userName);
    addToParticipantsList(`${userName} (You)`, id);
});

// Chat Logic
let text = document.querySelector('#chat_message');
text.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && text.value.length !== 0) {
        socket.emit('message', text.value);
        text.value = '';
    }
});

socket.on('createMessage', (message, user) => {
    let li = document.createElement('li');
    li.innerHTML = `<b>${user}</b>: ${message}`;
    document.querySelector('.messages').append(li);
});

function addToParticipantsList(name, id) {
    const list = document.getElementById('participants-list');
    const li = document.createElement('li');
    li.setAttribute('id', `participant-${id}`);
    li.innerHTML = `👤 ${name}`;
    list.append(li);
}

function raiseHand() {
    socket.emit('raise-hand');
}

socket.on('user-raised-hand', (user) => {
    alert(`${user} raised their hand! ✋`);
});

// ... rest of your existing video/mute functions ...

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => video.play());
    videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => addVideoStream(video, userVideoStream));
    peers[userId] = call;
}