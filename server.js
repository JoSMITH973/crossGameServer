const express = require("express");
require("dotenv").config();
const port = process.env.PORT;
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.get("/chat", (req, res) => {
    res.sendFile(__dirname + "/index.html");
    // res.send("Welcome");
    // io.on("connection", (socket) => {
    //     res.send("Welcome");
    // })
});

io.on("connection", (socket) => {
    socket.on("createRoom", (socketId, userName, msg) => {
        console.log('socket.id :',socket.id)
        console.log('id reçu :',socketId)
        socket.join(socketId)
        // socket.to(socketId).emit('createRoom', socket.id, userName+" : "+msg)
        let randomNumber = 500;
        msg = parseInt(msg);
        if(msg === randomNumber) {
            io.emit('createRoom',socket.id, userName+" says the number is "+msg)
            io.emit('createRoom',socket.id, userName+" is right ! Well played ! You WIN !")
        }
        else{
            let operator = "smaller"  
            if(msg < randomNumber) {
                operator = "bigger"
            }
            io.emit('createRoom',socket.id, userName+" says the number is "+msg)
            io.emit('createRoom',socket.id, "The number is "+operator+" than "+msg+".")
        }
    })
});

app.post("/create", (req, res) => {
    io.on("connection", (socket) => {
        console.log("Creating the session");
        socket.on("player's nickname", (msg) => {
            console.log("player's nickname : " + msg);
        });
        socket.broadcast.emit("hi");
        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
});

app.post("/join", (req, res) => {
    io.on("connection", (socket) => {
        console.log("Joinning the session of ");
        socket.on("player's nickname", (msg) => {
            console.log("player's nickname: " + msg);
        });
        socket.broadcast.emit("hi");
        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
});

http.listen(port, () => {
    console.log(`server listening on port:${port}`);
});
