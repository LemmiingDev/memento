const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname)); // Sirve tus archivos HTML/JS/CSS

let players = {};

io.on('connection', (socket) => {
    console.log('Jugador conectado:', socket.id);

    // Registrar jugador
    players[socket.id] = { x: 0, y: 0, id: socket.id };

    // Enviar lista de jugadores al nuevo conectado
    socket.emit('currentPlayers', players);
    
    // Avisar a los demás que alguien entró
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Escuchar movimientos
    socket.on('playerMovement', (movementData) => {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].action = movementData.action;
        
        // Reenviar el movimiento a los demás
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    // Desconexión
    socket.on('disconnect', () => {
        console.log('Jugador desconectado');
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
