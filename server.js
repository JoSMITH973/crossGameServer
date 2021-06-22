const express = require("express");
require("dotenv").config();
const port = process.env.PORT;
const app = express();
const uniqid = require('uniqid')
const http = require("http").Server(app);
const io = require("socket.io")(http);

let users = [];

app.get("/MagicNumber", (req, res) => {
    res.sendFile(__dirname + "/index.html");
    // res.send("Welcome");
    // io.on("connection", (socket) => {
    //     res.send("Welcome");
    // })
});

app.get("/MagicNumber2", (req, res) => {
    res.sendFile(__dirname + "/index2.html");
    // res.send("Welcome");
    // io.on("connection", (socket) => {
    //     res.send("Welcome");
    // })
});

let randomNumber = Math.floor(Math.random() * 1348);
io.on("connection", (socket) => {
    console.log('userConnected')
    
    socket.on('createRoom', (userName) => {
        console.log(userName);
        let roomId = uniqid();
        socket.join(roomId);
        io.to(roomId).emit('createRoom',roomId)
    })

    socket.on("joinRoom", (room) => {
        console.log('joinRoom :',room);
        socket.join(room);
    });

    socket.on("magicNumber", (room, userName, numberPicked) => {
        socket.join(room);
        console.log('room :',room,'username :',userName,'numberPicked :',numberPicked);
        // socket.join(room)
        let operator = "=";
        // console.log('socket.id :',socket.id)
        console.log('id room reçu :',room)
        // socket.join(socketId)
        // socket.to(socketId).emit('createRoom', socket.id, userName+" : "+numberPicked)
        numberPicked = parseInt(numberPicked);

        if(numberPicked === randomNumber) {
            // io.emit('createRoom',socket.id, userName+" says the number is "+numberPicked);
            io.to(room).emit('magicNumber',room, userName, numberPicked, operator);
            randomNumber = Math.floor(Math.random() * 1348)
        }
        else{
            // Si le chiffre choisi est PLUS PETIT que le chiffre aléatoire alors signe ( < ) sinon ( > )
            operator = (numberPicked < randomNumber) ? "<" : ">";
            io.to(room).emit('magicNumber',room, userName, numberPicked, operator);
        }

        console.log(randomNumber);
    })

    // socket.join()
    
});

http.listen(port, () => {
    console.log(`server listening on port:${port}`);
});
