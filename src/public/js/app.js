const socket = io()
// io는 백엔드와 socketIO를 자동적으로 연결해주는 function
// io function은 알아서 socket.io를 실행하고 있는 서버를 찾음

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const nick = document.getElementById("nickname");
const nickForm = nick.querySelector("form")
// const formRoom = room.querySelector("form")

welcome.hidden = true;
room.hidden = true;
let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerHTML = message;
    console.log(message)
    ul.appendChild(li);
}

function backEnddone(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName}`
    const msgForm = room.querySelector("#msg")
    msgForm.addEventListener("submit", handleMessage)

    // const nameForm = room.querySelector("#name")
    // nameForm.addEventListener("submit", handleNickName)

}

function nicknameSet(msg){
    nick.hidden = true;
    welcome.hidden = false;
    const h2 = document.querySelector("h2");
    h2.innerText = `Welcome ${msg}`

}


function handleSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input")
    socket.emit("enter_room", input.value, backEnddone)
    // 1. 특정한 이벤트를 이름에 상관없이 emit해줄 수 있음
    // 2. object 전송 가능. string만 전송할 필요 x
    // 3. 서버에서 함수를 호출할 거임. 근데 그 함수는 프론트에 있음
    // 이게 왜 대단한 걸까?
    // 보통 웹소켓/네트워크 통신은 단방향 이벤트 기반
    // -> 근데 socket.io의 emit 마지막 인자에 콜백을 넣을 경우
    // -> request/response 스타일이 구현 가능함 (양방향 통신 쌉가능)
    // -> 즉 http 처럼 요청/응답 패턴을 소캣에서 흉내낼 수 있음
    roomName = input.value;
    input.value = "";
}

function handleMessage(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = ""
}

function handleNickName(event){
    event.preventDefault();
    const input = nick.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname", value, nicknameSet);
    input.value = ""
}



form.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickName)

socket.on("welcome", (user, newCount)=>{
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`${user} Joined!`)
});

socket.on("bye", (left, newCount)=>{
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`${left} left ㅠㅠ`)
})

socket.on("new_message", msg =>{
    addMessage(msg);
})

socket.on("nickname", nicknameSet)

socket.on("room_change", ((rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0){
        roomList.innerHTML = "";
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerHTML = room;
        roomList.append(li);
    })
}))