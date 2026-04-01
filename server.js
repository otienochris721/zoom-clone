const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const path = require('path'); // Only keep this one!

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId);
        
        // Notify others someone joined
        setTimeout(() => {
            socket.to(roomId).emit('user-connected', userId, userName);
        }, 1000);

        // Chat
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message, userName);
        });

        // Hand Raise
        socket.on('raise-hand', () => {
            io.to(roomId).emit('user-raised-hand', userName);
        });

        // Disconnect
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId, userName);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));