const express = require("express");
require("dotenv").config();
const port = process.env.PORT;
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
    // res.sendFile(__dirname + "/index.html");
    res.send("Welcome");
    // io.on("connection", (socket) => {
    //     res.send("Welcome");
    // })
});

io.on("connection", (socket) => {
    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
        io.emit("chat message 2", "hi Stranger");
    });
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
