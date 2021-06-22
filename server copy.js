const express = require("express");
require("dotenv").config();
const port = process.env.PORT;
const app = express();
const uniqid = require('uniqid')
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.get("/MagicNumber", (req, res) => {
    res.sendFile(__dirname + "/index.html");
    // res.send("Welcome");
    // io.on("connection", (socket) => {
    //     res.send("Welcome");
    // })
});

io.on("connection", (socket) => {
    let roomId = uniqid();
    let randomNumber = Math.floor(Math.random() * 1348);
    socket.on("createRoom", (socketId, userName, numberPicked) => {
        let operator = "=";
        console.log('socket.id :',socket.id)
        console.log('id reçu :',socketId)
        socket.join(socketId)
        // socket.to(socketId).emit('createRoom', socket.id, userName+" : "+numberPicked)
        numberPicked = parseInt(numberPicked);

        if(numberPicked === randomNumber) {
            // io.emit('createRoom',socket.id, userName+" says the number is "+numberPicked);
            io.emit('createRoom',socket.id, userName, numberPicked, operator);
            randomNumber = Math.floor(Math.random() * 1348)
        }
        else{
            // Si le chiffre choisi est PLUS PETIT que le chiffre aléatoire alors signe ( < ) sinon ( > )
            operator = (numberPicked < randomNumber) ? "<" : ">";
            io.emit('createRoom',socket.id, userName, numberPicked, operator);
        }
        console.log(randomNumber);
    })
    socket.on("createRoom", (socketId, userName, numberPicked) => {
        let operator = "=";
        console.log('socket.id :',socket.id)
        console.log('id reçu :',socketId)
        socket.join(socketId)
        // socket.to(socketId).emit('createRoom', socket.id, userName+" : "+numberPicked)
        numberPicked = parseInt(numberPicked);

        if(numberPicked === randomNumber) {
            // io.emit('createRoom',socket.id, userName+" says the number is "+numberPicked);
            io.emit('createRoom',socket.id, userName, numberPicked, operator);
            randomNumber = Math.floor(Math.random() * 1348)
        }
        else{
            // Si le chiffre choisi est PLUS PETIT que le chiffre aléatoire alors signe ( < ) sinon ( > )
            operator = (numberPicked < randomNumber) ? "<" : ">";
            io.emit('createRoom',socket.id, userName, numberPicked, operator);
        }
        console.log(randomNumber);
    })
});

http.listen(port, () => {
    console.log(`server listening on port:${port}`);
});
