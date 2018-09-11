const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const {generateMessage, generateLocationMessage} = require('./utils/message');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('server connected');

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));

    socket.broadcast.emit('newMessage', 
        generateMessage('Admin', 'New users joined')
    );

    socket.on('createMessage', (message, callback) => {
        console.log('New Message: ', message);

        io.emit('newMessage', generateMessage(message.from, message.text));
        
        callback("This is from server");
    });

    socket.on('createLocationMessage', (coords, callback) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
        callback('sent location');
    });

    socket.on('disconnect', () => {
        console.log('server disconnect');
    });
});

server.listen(port, () => {
    console.log(`server started at ${port}`)
});