import http from "http";
import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();
const port = 3000;

app.set("view engine", "pug")
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const handleListen = () => console.log(`listening on port: ${port}`)

const httpserver = http.createServer(app);
const wsServer = new Server(httpserver,{
    cors: {
        origin: ["https://admin.socket.io"],
        Credential: true,
    },
});
instrument(wsServer, {
    auth:false
});

function publicRoooms(){
    const sids = wsServer.sockets.adapter.sids;
    const rooms = wsServer.sockets.adapter.rooms;

    const publicRooms = [];
    rooms.forEach((_,key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key)
        }     
    });
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size
}

wsServer.on("connection", socket=>{
    socket.nickname = "Anon";
// connection은 socket.io에서 정한 예약 이벤트 이름
// connection은 클라이언트 연결이 발생할 때만 실행되는 고정 이벤트
    socket.onAny((event) =>{
        console.log(wsServer.sockets.adapter);
        console.log(`Socket Event: ${event}`)
    })
    socket.on("enter_room", (roomName, done) =>{
    // enter_room 은 커스텀 이벤트라 사용자 마음대로 설정 가능
        socket.join(roomName); // roomName 이름인 방에 join
        done()
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRoooms());
    })
    socket.on("disconnecting", () => {
        // console.log("when disc ", socket.rooms)
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) -1));
        // socket.rooms는 각각의 소켓 안에 있는 set인거임
        // Ex) Set(1) { '2fTY8yKuTbxqDGAwAAAB' }
    })
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", publicRoooms());
    })
    socket.on("new_message", (msg, room, done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })
    socket.on("nickname", (nickname, done) => {
        socket["nickname"] = nickname;
        done();
        socket.emit("nickname", socket.nickname)
    })
    // socket.on()
})

httpserver.listen(port, handleListen)