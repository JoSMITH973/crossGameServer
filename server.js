const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
    // res.send("<h1>Hello World!</h1><br/><h3>Bienvenue sur notre platforme</h3>");
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("player's nickname", (msg) => {
        console.log("player's nickname: " + msg);
    });
    socket.broadcast.emit('hi');
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

server.listen(port, () => {
    console.log(`server listening on port:${port}`);
});
