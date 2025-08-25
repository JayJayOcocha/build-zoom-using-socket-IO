const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("#welcome #roomName");
const form2 = welcome.querySelector("#welcome #name")
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
    console.log(message)
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message
    ul.appendChild(li)
}

function handleMessageSubmit(event){
    event.preventDefault()
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName ,()=>{
        addMessage(`You: ${value}`);
    });
    input.value = "";
}
function handleNicknameSubmit(event){
    event.preventDefault();
    const nick = form2.querySelector("input")
    // console.log(nick.value)
    const value = nick.value;
    socket.emit("nickname", value );
}


function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`
    const msgForm = room.querySelector("#msg")
    msgForm.addEventListener("submit", handleMessageSubmit)
}

function handleRoomSubmit(event){
    event.preventDefault();

    const room = form.querySelector("input")
    console.log(room.value)

    const nick = form2.querySelector("input")
    console.log(nick.value)
    // console.log()

    socket.emit("enter_room", 
    room.value, nick.value,
    showRoom
    )
    roomName = room.value;
    room.value = ""
}

form2.addEventListener("submit", handleNicknameSubmit)
form.addEventListener("submit", handleRoomSubmit)

socket.on("welcome", (user, newCount) =>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`${user} joined!`);
})

socket.on("bye", (left, newCount) =>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`${left} left!`);
})

socket.on("new_message", addMessage)

socket.on("room_change", (rooms)=>{
    const roomLists = welcome.querySelector("ul");
    roomLists.innerHTML = "";
    if(rooms.length === 0){
        
        return;
    }
    rooms.forEach((room) =>{
        const li = document.createElement("li");
        li.innerText = room;
        roomLists.append(li);
    });
})