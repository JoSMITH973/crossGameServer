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
let usersArray = [];
io.on("connection", (socket) => {
    console.log('user connected')
    
    socket.on('createRoom', (userName) => {
        let roomId = uniqid.time();
        socket.join(roomId);
        io.in(roomId).emit('createRoom',roomId);
        console.log(userName,' create a session : ',roomId);
        usersArray.push(
            {
                roomId: roomId,
                players: {
                    host: {
                        socketId: socket.id,
                        name: userName
                    },
                    guest: null
                }
            }
        );
        console.log('array :',usersArray);
    })

    socket.on("joinRoom", (room, userName) => {
        console.log('joinRoom :',room);
        let clientsNumberInSession = io.of("/").adapter.rooms.get(room).size;
        console.log('session number before join :', clientsNumberInSession );
        
        let indexRoom = usersArray.findIndex( element => element.roomId == room);
        console.log('index :',indexRoom);
        if(clientsNumberInSession === 1) {
            let players = usersArray[indexRoom].players;
            players.guest = {
                socketId: socket.id,
                name: userName
            }
            console.log('this array :', usersArray[indexRoom]);
            socket.join(room);
            console.log('session number after join :', clientsNumberInSession );
            return io.in(room).emit("joinRoom","=", players.host.name, players.guest.name);
        }
        else {
            console.log('impossible to join')
            return socket.emit("joinRoom","!")
        }
    });
    
    socket.on("magicNumber", (room, userName, numberPicked) => {
        // let clientsNumberInSession = io.of("/").adapter.rooms.get(room).size;
        // console.log('session :', clientsNumberInSession );
        // if(clientsNumberInSession > 2) {
        //     return socket.emit('magicNumber',room, userName, 0, "!");
        // }
        // socket.join(room);
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
            // io.in(room).emit('magicNumber',room, userName, numberPicked, operator);
            io.to(room).emit('magicNumber',room, userName, numberPicked, operator);
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
