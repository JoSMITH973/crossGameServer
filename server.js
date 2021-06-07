const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req,res) => {
    io.on("connection", (socket) => {
        res.send("Welcome");
    })
})

app.post("/create", (req, res) => {
    io.on("connection", (socket) => {
        console.log("Creating the session");
        socket.on("player's nickname", (msg) => {
            console.log("player's nickname : " + msg);
        });
        socket.broadcast.emit('hi');
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
        socket.broadcast.emit('hi');
        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
});

server.listen(port, () => {
    console.log(`server listening on port:${port}`);
});
