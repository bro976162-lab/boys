const app = document.querySelector(".app");

const chatUsers = document.querySelectorAll(".chat-user");

const selectedName = document.getElementById("selectedName");
const selectedAvatar = document.getElementById("selectedAvatar");
const onlineStatus = document.getElementById("onlineStatus");

const messages = document.getElementById("messages");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const searchInput = document.getElementById("searchInput");


// SELECT CHAT

chatUsers.forEach(user => {

    user.addEventListener("click", () => {

        const name = user.dataset.name;

        selectedName.textContent = name;

        selectedAvatar.textContent = name.charAt(0);

        onlineStatus.textContent = "online";

        app.classList.add("chat-open");

        messageInput.focus();

    });

});


// SEND MESSAGE

function sendMessage() {

    const text = messageInput.value.trim();

    if (text === "") {
        return;
    }

    const message = document.createElement("div");

    message.classList.add("message", "sent");

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    message.innerHTML = `
        <p>${text}</p>
        <span>${time} ✓</span>
    `;

    messages.appendChild(message);

    messageInput.value = "";

    messages.scrollTop = messages.scrollHeight;

    // Demo auto reply
    setTimeout(() => {

        const reply = document.createElement("div");

        reply.classList.add("message", "received");

        reply.innerHTML = `
            <p>Okay 👍</p>
            <span>${time}</span>
        `;

        messages.appendChild(reply);

        messages.scrollTop = messages.scrollHeight;

    }, 1000);
}


// SEND BUTTON

sendBtn.addEventListener("click", sendMessage);


// ENTER KEY

messageInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        sendMessage();
    }

});


// SEARCH CHAT

searchInput.addEventListener("input", () => {

    const searchText = searchInput.value.toLowerCase();

    chatUsers.forEach(user => {

        const name = user.dataset.name.toLowerCase();

        if (name.includes(searchText)) {
            user.style.display = "flex";
        } else {
            user.style.display = "none";
        }

    });

});


// EMOJI BUTTON

document.getElementById("emojiBtn").addEventListener("click", () => {

    messageInput.value += " 😊";

    messageInput.focus();

});
