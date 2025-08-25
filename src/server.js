import http from "http";
import express from "express";
import SocketIO from "socket.io";
import { count } from "console";

const app = express();
const port = 3000;

app.set("view engine", "pug")
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const handleListen = () => console.log(`listening on port: ${port}`)

const httpserver = http.createServer(app);
const wsServer = SocketIO(httpserver);

function publicRooms(){
    const sids = wsServer.sockets.adapter.sids;
    const rooms = wsServer.sockets.adapter.rooms;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => {
    socket["nickname"] = "Anon"

    console.log(" wtwttffff ",socket.nickname)
    socket.onAny((event)=>{
        console.log(`Socket Event:${event}`)
    })
    socket.on("enter_room", (roomName,nick, done) =>{
        socket.nickname = nick
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome" , nick, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("disconnecting", () => { // 여기 어떻게 잘 해야할듯
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) -1));
        
    });
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message", (msg, room, done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`)
        done();
    })
    socket.on("nickname", (nickname) => socket["nickname"] = nickname)
})
httpserver.listen(port, handleListen)