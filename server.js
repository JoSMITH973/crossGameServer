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
                players: [
                    {
                        socketId: socket.id,
                        name: userName,
                        point: 0
                    }
                ]
            }
        );
        console.log('array :',usersArray);
    })

    socket.on("joinRoom", (room, userName) => {
        let whichPlayerStart = Math.floor(Math.random() * 2);
        console.log('joinRoom :',room);
        let clientsNumberInSession = io.of("/").adapter.rooms.get(room).size;
        console.log('session number before join :', clientsNumberInSession );
        
        let indexRoom = usersArray.findIndex( element => element.roomId == room);
        console.log('index :',indexRoom);

        if(clientsNumberInSession === 1 && indexRoom >= 0) {
            usersArray[indexRoom].beg = new Date();
            let players = usersArray[indexRoom].players;
            players.push({
                socketId: socket.id,
                name: userName,
                point: 0
            })
            console.log('this array :', usersArray[indexRoom]);
            socket.join(room);
            console.log('session number after join :', clientsNumberInSession );
            return io.in(room).emit("joinRoom", "=", players[0].name, players[1].name, whichPlayerStart);
        }
        else {
            console.log('impossible to join')
            return socket.emit("joinRoom","!")
        }
    });
    
    function sendPoint(room, indexRoom, userName) {
        let players = usersArray[indexRoom].players;
        let indexPlayer = players.findIndex( element => element.name == userName);
        let playerName = players[indexPlayer].name;
        players[indexPlayer].point = players[indexPlayer].point+1;
        console.log('player : '+playerName+' point : ',players[indexPlayer].point);
        io.in(room).emit('magicNumberPoint', room, playerName, players[indexPlayer].point);
        
        // if(players[indexPlayer].point === 3) {
        if(players[indexPlayer].point === 3) {
            let dataScore = {
                magicNumber:[
                    {
                        beg: `${usersArray[indexRoom].beg}`,
                        end: `${new Date()}`,
                        players:[
                            {name: `${players[0].name}`,point: `${players[0].point}`},
                            {name: `${players[1].name}`,point: `${players[1].point}`}
                        ]
                    }
                ]
            }
            const gameFile = JSON.parse(fs.readFileSync('./games.json'))
            JSON.stringify(dataScore)
            gameFile.push(dataScore)
            console.log('gameFile object :',gameFile)
            fs.writeFileSync('games.json',JSON.stringify(gameFile));
            console.log('read file :', JSON.parse(fs.readFileSync('./games.json')) )
        }
    };

    socket.on("magicNumber", (room, userName, numberPicked, whichPlayerStart) => {
        let indexRoom = usersArray.findIndex( element => element.roomId == room);
        let operator = "=";

        console.log('room :',room,'username :',userName,'numberPicked :',numberPicked);
        numberPicked = parseInt(numberPicked);
        whichPlayerStart = (whichPlayerStart === usersArray[indexRoom].players[0].name) ? usersArray[indexRoom].players[1].name : usersArray[indexRoom].players[0].name;
        // console.log('whichPlayerSatrt :',whichPlayerStart);

        if(numberPicked === randomNumber) {
            // io.emit('createRoom',socket.id, userName+" says the number is "+numberPicked);
            io.in(room).emit('magicNumber',room, userName, numberPicked, operator, whichPlayerStart);
            randomNumber = Math.floor(Math.random() * 1348)

            console.log('indexRoom ',indexRoom);
            console.log('why :',usersArray[indexRoom]);
            if(indexRoom>=0) {
                // io.in(room).emit('magicNumberPoint', room, indexRoom, userName);
                sendPoint(room, indexRoom, userName);
            }
        }
        else{
            // Si le chiffre choisi est PLUS PETIT que le chiffre aléatoire alors signe ( < ) sinon ( > )
            operator = (numberPicked < randomNumber) ? "<" : ">";
            io.in(room).emit('magicNumber',room, userName, numberPicked, operator, whichPlayerStart);
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
