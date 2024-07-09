const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname + '/public'));

wss.on('connection', (ws) => {
    console.log('A user connected');

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'join') {
            ws.username = parsedMessage.username;
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'status', msg: `${ws.username} has joined the chat.` }));
                }
            });
        } else if (parsedMessage.type === 'message') {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'message', username: ws.username, msg: parsedMessage.msg }));
                }
            });
        } else if (parsedMessage.type === 'typing') {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'typing', username: ws.username, msg: parsedMessage.msg }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('A user disconnected');
        if (ws.username) {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'status', msg: `${ws.username} has left the chat.` }));
                }
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

