const express = require("express");
require("dotenv").config();
const port = process.env.PORT;
const app = express();
const uniqid = require('uniqid');
const http = require("http").Server(app);
const io = require("socket.io")(http);

let users = [];

app.get("/MagicNumber", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/MagicNumber2", (req, res) => {
    res.sendFile(__dirname + "/index2.html");
});

let randomNumber = Math.floor(Math.random() * 1348);
io.on("connection", (socket) => {
    console.log('user connected')
    
    socket.on('createRoom', (userName) => {
        console.log(userName);
        let roomId = uniqid.time();
        socket.join(roomId);
        io.in(roomId).emit('createRoom',roomId)
    })

    socket.on("joinRoom", (room) => {
        console.log('joinRoom :',room);
        console.log("in Join :",io.sockets.adapter.rooms.get(room));
        socket.join(room);
    });
    
    socket.on("magicNumber", (room, userName, numberPicked) => {
        console.log('session :', io.of("/").adapter.rooms.get(room).size );
        socket.join(room);
        console.log('room :',room,'username :',userName,'numberPicked :',numberPicked);
        let operator = "=";
        console.log('id room reçu :',room)
        numberPicked = parseInt(numberPicked);

        if(numberPicked === randomNumber) {
            // io.emit('createRoom',socket.id, userName+" says the number is "+numberPicked);
            io.in(room).emit('magicNumber',room, userName, numberPicked, operator);
            randomNumber = Math.floor(Math.random() * 1348)
        }
        else{
            // Si le chiffre choisi est PLUS PETIT que le chiffre aléatoire alors signe ( < ) sinon ( > )
            operator = (numberPicked < randomNumber) ? "<" : ">";
            io.in(room).emit('magicNumber',room, userName, numberPicked, operator);
        }

        console.log(randomNumber);
    })

    socket.on("disconnect", () => {
        console.log('user disconnected');
    })
});

http.listen(port, () => {
    console.log(`server listening on port:${port}`);
});
