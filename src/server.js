import http from "http";
import express from "express";
import SocketIO from "socket.io";

const app = express();
const port = 3000;

app.set("view engine", "pug")
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const handleListen = () => console.log(`listening on port: ${port}`)

const httpserver = http.createServer(app);
const wsServer = SocketIO(httpserver);

wsServer.on("connection", socket => {
    socket["nickname"] = "Anon"
    socket.onAny((event)=>{
        console.log(`Socket Event:${event}`)
    })
    socket.on("enter_room", (roomName, done) =>{
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome" , socket.nickname);
    })
    socket.on("disconnecting", ()=>{
        socket.rooms.forEach(room => socket .to(room).emit("bye", socket.nickname));
    })
    socket.on("new_message", (msg, room, done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`)
        done();
    })
    socket.on("nickname", (nickname) => socket["nickname"] = nickname)
})
httpserver.listen(port, handleListen)