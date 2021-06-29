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
    })

    socket.on("joinRoom", (room, userName) => {
        let whichPlayerStart = Math.floor(Math.random() * 2);
        
        // index de l'objet où se trouve la room recherché
        let indexRoom = usersArray.findIndex( element => element.roomId == room);
        
        // Si la room n'existe pas indexRoom retourne -1 et donc on retourne une erreur
        if (indexRoom === -1 ) {
            console.log('impossible to join')
            return socket.emit("joinRoom","!")
        }

        // Nombre de clients dans la session (room)
        let clientsNumberInSession = io.of("/").adapter.rooms.get(room).size;
        
        if(clientsNumberInSession === 1 ) {
            usersArray[indexRoom].beg = new Date();
            let players = usersArray[indexRoom].players;
            players.push({
                socketId: socket.id,
                name: userName,
                point: 0
            })
            socket.join(room);
            return io.in(room).emit("joinRoom", "=", players[0].name, players[1].name, whichPlayerStart);
        }
        else {
            console.log('impossible to join')
            return socket.emit("joinRoom","!")
        }
    });
    
    // This function send point on a socket to all the users
    function sendPoint(room, indexRoom, userName) {
        let players = usersArray[indexRoom].players;
        let indexPlayer = players.findIndex( element => element.name == userName);
        let playerName = players[indexPlayer].name;
        players[indexPlayer].point = players[indexPlayer].point+1;
        io.in(room).emit('magicNumberPoint', room, playerName, players[indexPlayer].point);
        
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
            fs.writeFileSync('games.json',JSON.stringify(gameFile));
            console.log('This party has been write in the games.json file.')
        }
    };

    socket.on("magicNumber", (room, userName, numberPicked, whichPlayerStart) => {
        let indexRoom = usersArray.findIndex( element => element.roomId == room);
        let operator = "=";

        numberPicked = parseInt(numberPicked);
        whichPlayerStart = (whichPlayerStart === usersArray[indexRoom].players[0].name) ? usersArray[indexRoom].players[1].name : usersArray[indexRoom].players[0].name;

        if(numberPicked === randomNumber) {
            io.in(room).emit('magicNumber',room, userName, numberPicked, operator, whichPlayerStart);
            randomNumber = Math.floor(Math.random() * 1348)

            // On vérifie que la session existe bien avant d'utiliser la fonction sendPoint
            if(indexRoom >= 0) {
                sendPoint(room, indexRoom, userName);
            }
        }
        else{
            // Si le chiffre choisi est PLUS PETIT que le chiffre aléatoire alors signe ( < ) sinon ( > )
            operator = (numberPicked < randomNumber) ? "<" : ">";
            io.in(room).emit('magicNumber',room, userName, numberPicked, operator, whichPlayerStart);
            // io.to(room).emit('magicNumber',room, userName, numberPicked, operator);
        }

        // On affiche le chiffre réel dans la console
        console.log('chiffre à trouver :',randomNumber);
    })

    socket.on("disconnect", () => {
        console.log('user disconnected');
    })
});

http.listen(port, () => {
    console.log(`server listening on port:${port}`);
});
