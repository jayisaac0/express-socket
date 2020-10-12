const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const {userController, preloadUsers }= require('./controllers/user.controller');
const {profileController, preloadProfile }= require('./controllers/profile.controller');
require("dotenv").config();

const app = express();
app.use(cors());
const server = http.createServer(app);

const WebSocket = require('ws').Server;
const ws = new WebSocket({ port: 8080 })

mongoose.connect('mongodb://localhost/websockets', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to database'))
.catch(err => console.error('Could not connect', err));

 
ws.on('connection', async(socket) => {
    socket.isAlive = true;
    socket.on('pong', () => {
        socket.isAlive = true;
    });

    socket.on('message', async(message) => {

        userController(ws, socket, message);
        profileController(ws, socket, message);
          /*** Firecamp testing --**/
          preloadUsers(socket);
          preloadProfile(socket);
          /** --end --**/

    });

    preloadUsers(socket);
    preloadProfile(socket);

    
    socket.on('close', () => {
        console.log("I lost a client");
    });
    console.log("One more cient conected");
       
});

setInterval(() => {
    ws.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping(null, false, true);
    });
  }, 10000);
  
server.listen(Number(2500), () => {
    console.log(`Server started on port ${JSON.stringify({server})} `);
});

