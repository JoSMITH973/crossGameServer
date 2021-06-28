const express = require("express");
require("dotenv").config();
const port = process.env.PORT;
const app = express();
const uniqid = require('uniqid');
const http = require("http").Server(app);
const io = require("socket.io")(http);
const fs = require('fs');

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
                beg: null,
                end: null,
                players: {
                    host: {
                        socketId: socket.id,
                        name: userName,
                        point: 0
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
            usersArray[indexRoom].beg = new Date();
            let players = usersArray[indexRoom].players;
            players.guest = {
                socketId: socket.id,
                name: userName,
                point: 0
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
        console.log('room :',room,'username :',userName,'numberPicked :',numberPicked);
        let operator = "=";
        console.log('id room reçu :',room)
        numberPicked = parseInt(numberPicked);

        if(numberPicked === randomNumber) {
            // io.emit('createRoom',socket.id, userName+" says the number is "+numberPicked);
            io.in(room).emit('magicNumber',room, userName, numberPicked, operator);
            randomNumber = Math.floor(Math.random() * 1348)

            let indexRoom = usersArray.findIndex( element => element.roomId == room);
            let players = usersArray[indexRoom].players;
            let indexPlayer = players.findIndex( element => element.name == userName);
            players[indexPlayer].point = players[indexPlayer].point+1;

            if(players.host.point === 3 || players.guest.point === 3 ) {
                let dataScore = {
                    magicNumber:[
                        {
                            beg: `${usersArray[indexRoom].beg}`,
                            end: `${new Date()}`,
                            players:[
                                {name: `${players.host.name}`,point: `${players.host.point}`},
                                {name: `${players.guest}`,point: `${players.guest.point}`}
                            ]
                        }
                    ]
                }
                const gameFile = JSON.parse(fs.readFileSync('./games.json'))
                JSON.stringify(dataScore)
            }
        }
        else{
            // Si le chiffre choisi est PLUS PETIT que le chiffre aléatoire alors signe ( < ) sinon ( > )
            operator = (numberPicked < randomNumber) ? "<" : ">";
            io.in(room).emit('magicNumber',room, userName, numberPicked, operator);
            // io.to(room).emit('magicNumber',room, userName, numberPicked, operator);
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
