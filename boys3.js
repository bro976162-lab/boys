import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ===============================
// FIREBASE CONFIG
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyCUhCfOlm0fk7omOwqcg7y3xkX77_xDrFI",
  authDomain: "boys-c950b.firebaseapp.com",
  projectId: "boys-c950b",
  storageBucket: "boys-c950b.firebasestorage.app",
  messagingSenderId: "182409162273",
  appId: "1:182409162273:web:ed5d49b560e400e889fd60",
  measurementId: "G-LRCQV0CESH"
};


// ===============================
// INITIALIZE FIREBASE
// ===============================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


// ===============================
// HTML ELEMENTS
// ===============================

const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("app");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const authButton = document.getElementById("authButton");
const authMessage = document.getElementById("authMessage");

const logoutButton = document.getElementById("logoutButton");

const myName = document.getElementById("myName");
const myEmail = document.getElementById("myEmail");
const myAvatar = document.getElementById("myAvatar");
const myStatus = document.getElementById("myStatus");

const usersList = document.getElementById("usersList");
const searchInput = document.getElementById("searchInput");

const emptyChat = document.getElementById("emptyChat");
const chatBox = document.getElementById("chatBox");

const chatName = document.getElementById("chatName");
const chatStatus = document.getElementById("chatStatus");
const chatAvatar = document.getElementById("chatAvatar");

const messagesBox = document.getElementById("messages");

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const backButton = document.getElementById("backButton");


// ===============================
// VARIABLES
// ===============================

let isSignup = false;
let currentUser = null;
let currentProfile = null;
let selectedUser = null;

let usersData = [];
let unsubscribeUsers = null;
let unsubscribeMessages = null;


// ===============================
// LOGIN / SIGNUP TAB
// ===============================

loginTab.addEventListener("click", () => {

  isSignup = false;

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  nameInput.classList.add("hidden");

  authButton.textContent = "Login";

  authMessage.textContent = "";
});


signupTab.addEventListener("click", () => {

  isSignup = true;

  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  nameInput.classList.remove("hidden");

  authButton.textContent = "Sign Up";

  authMessage.textContent = "";
});


// ===============================
// LOGIN / SIGNUP
// ===============================

authButton.addEventListener("click", async () => {

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  authMessage.textContent = "";

  if (isSignup && name.length < 2) {

    authMessage.textContent = "Please enter your name.";

    return;
  }

  if (!email) {

    authMessage.textContent = "Please enter your email.";

    return;
  }

  if (password.length < 6) {

    authMessage.textContent =
      "Password must be at least 6 characters.";

    return;
  }


  try {

    authButton.disabled = true;


    // ===============================
    // SIGN UP
    // ===============================

    if (isSignup) {

      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = result.user;


      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: name,
          email: email,
          online: true,
          lastSeen: serverTimestamp(),
          createdAt: serverTimestamp()
        }
      );


      authMessage.textContent =
        "Account created successfully.";

    }


    // ===============================
    // LOGIN
    // ===============================

    else {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    }

  } catch (error) {

    console.error("AUTH ERROR:", error);

    if (error.code === "auth/email-already-in-use") {

      authMessage.textContent =
        "This email is already registered.";

    }

    else if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {

      authMessage.textContent =
        "Email or password is incorrect.";

    }

    else if (error.code === "auth/weak-password") {

      authMessage.textContent =
        "Password must be at least 6 characters.";

    }

    else if (error.code === "auth/invalid-email") {

      authMessage.textContent =
        "Please enter a valid email.";

    }

    else if (error.code === "auth/operation-not-allowed") {

      authMessage.textContent =
        "Email/Password login Firebase me enabled nahi hai.";

    }

    else {

      authMessage.textContent =
        error.message;

    }

  } finally {

    authButton.disabled = false;

  }

});


// ===============================
// AUTH STATE
// ===============================

onAuthStateChanged(auth, async (user) => {

  if (user) {

    currentUser = user;

    try {

      await loadMyProfile();

      authScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");

      if (myStatus) {
        myStatus.textContent = "Online";
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          online: true,
          lastSeen: serverTimestamp()
        },
        {
          merge: true
        }
      );

      loadUsers();

    } catch (error) {

      console.error("PROFILE ERROR:", error);

      authMessage.textContent =
        "Profile load nahi ho raha. Firebase check karo.";

    }

  }

  else {

    currentUser = null;
    currentProfile = null;

    authScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");

  }

});


// ===============================
// LOAD MY PROFILE
// ===============================

async function loadMyProfile() {

  if (!currentUser) return;

  const userRef =
    doc(db, "users", currentUser.uid);

  const snapshot =
    await getDoc(userRef);


  if (snapshot.exists()) {

    currentProfile = snapshot.data();

  }

  else {

    currentProfile = {

      uid: currentUser.uid,

      email: currentUser.email,

      name:
        currentUser.email?.split("@")[0] || "User"

    };


    await setDoc(
      userRef,
      {
        ...currentProfile,
        online: true,
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp()
      },
      {
        merge: true
      }
    );

  }


  myName.textContent =
    currentProfile.name || "User";

  myEmail.textContent =
    currentProfile.email || currentUser.email;

  myAvatar.textContent =
    getInitials(currentProfile.name);

}


// ===============================
// LOAD USERS
// ===============================

function loadUsers() {

  if (unsubscribeUsers) {
    unsubscribeUsers();
  }


  const usersQuery =
    query(
      collection(db, "users"),
      orderBy("name")
    );


  unsubscribeUsers = onSnapshot(

    usersQuery,

    (snapshot) => {

      usersData = [];


      snapshot.forEach((item) => {

        const user = item.data();


        if (
          currentUser &&
          user.uid !== currentUser.uid
        ) {

          usersData.push(user);

        }

      });


      renderUsers(usersData);

    },

    (error) => {

      console.error(
        "USERS ERROR:",
        error
      );

      usersList.innerHTML =
        `<p class="loading">
          Users load nahi ho rahe.
        </p>`;

    }

  );

}


// ===============================
// RENDER USERS
// ===============================

function renderUsers(users) {

  usersList.innerHTML = "";


  if (users.length === 0) {

    usersList.innerHTML =
      `<p class="loading">
        Abhi koi other user nahi mila.
      </p>`;

    return;

  }


  users.forEach((user) => {

    const item =
      document.createElement("div");

    item.className =
      "user-item";


    item.innerHTML = `

      <div class="avatar">
        ${escapeHTML(
          getInitials(user.name)
        )}
      </div>

      <div class="user-info">

        <strong>
          ${escapeHTML(
            user.name || "User"
          )}
        </strong>

        <span>
          ${
            user.online
              ? "Online"
              : "Offline"
          }
        </span>

      </div>

      ${
        user.online
          ? `<div class="online-dot"></div>`
          : ""
      }

    `;


    item.addEventListener(
      "click",
      () => openChat(user)
    );


    usersList.appendChild(item);

  });

}


// ===============================
// SEARCH USERS
// ===============================

searchInput.addEventListener(
  "input",
  () => {

    const value =
      searchInput.value
        .toLowerCase()
        .trim();


    const filtered =
      usersData.filter((user) => {

        const name =
          (user.name || "")
            .toLowerCase();

        const email =
          (user.email || "")
            .toLowerCase();


        return (
          name.includes(value) ||
          email.includes(value)
        );

      });


    renderUsers(filtered);

  }
);


// ===============================
// OPEN CHAT
// ===============================

function openChat(user) {

  selectedUser = user;


  emptyChat.classList.add("hidden");

  chatBox.classList.remove("hidden");

  appScreen.classList.add("chat-open");


  chatName.textContent =
    user.name || "User";

  chatAvatar.textContent =
    getInitials(user.name);


  updateChatStatus(user);

  loadMessages();

}


// ===============================
// CHAT STATUS
// ===============================

function updateChatStatus(user) {

  chatStatus.textContent =
    user.online
      ? "Online"
      : "Offline";

}


// ===============================
// CHAT ID
// ===============================

function getChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


// ===============================
// LOAD MESSAGES
// ===============================

function loadMessages() {

  if (
    !currentUser ||
    !selectedUser
  ) {
    return;
  }


  if (unsubscribeMessages) {

    unsubscribeMessages();

  }


  messagesBox.innerHTML = "";


  const chatId =
    getChatId(
      currentUser.uid,
      selectedUser.uid
    );


  const messagesRef =
    collection(
      db,
      "chats",
      chatId,
      "messages"
    );


  const messagesQuery =
    query(
      messagesRef,
      orderBy("createdAt"),
      limit(300)
    );


  unsubscribeMessages =
    onSnapshot(

      messagesQuery,

      (snapshot) => {

        messagesBox.innerHTML = "";


        snapshot.forEach((item) => {

          renderMessage(
            item.data()
          );

        });


        scrollMessages();

      },

      (error) => {

        console.error(
          "MESSAGES ERROR:",
          error
        );

        messagesBox.innerHTML =
          `<p class="loading">
            Messages load nahi ho rahe.
          </p>`;

      }

    );

}


// ===============================
// RENDER MESSAGE
// ===============================

function renderMessage(message) {

  const div =
    document.createElement("div");


  const sent =
    message.senderId ===
    currentUser.uid;


  div.className =
    sent
      ? "message sent"
      : "message received";


  let time = "";


  if (message.createdAt) {

    try {

      time =
        formatTime(
          message.createdAt.toDate()
        );

    } catch (error) {

      time = "";

    }

  }


  div.innerHTML = `

    ${escapeHTML(
      message.text || ""
    )}

    <span class="message-time">

      ${time}

      ${
        sent
          ? " ✓"
          : ""
      }

    </span>

  `;


  messagesBox.appendChild(div);

}


// ===============================
// SEND MESSAGE
// ===============================

sendButton.addEventListener(
  "click",
  sendMessage
);


messageInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {

      event.preventDefault();

      sendMessage();

    }

  }
);


async function sendMessage() {

  if (
    !currentUser ||
    !selectedUser
  ) {

    return;

  }


  const text =
    messageInput.value.trim();


  if (!text) {

    return;

  }


  try {

    sendButton.disabled = true;


    const chatId =
      getChatId(
        currentUser.uid,
        selectedUser.uid
      );


    await addDoc(

      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),

      {

        senderId:
          currentUser.uid,

        receiverId:
          selectedUser.uid,

        text: text,

        createdAt:
          serverTimestamp(),

        read: false

      }

    );


    messageInput.value = "";

    messageInput.focus();

  }

  catch (error) {

    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    alert(
      "Message send nahi hua. Firebase settings check karo."
    );

  }

  finally {

    sendButton.disabled = false;

  }

}


// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener(
  "click",
  async () => {

    try {

      if (currentUser) {

        await setDoc(

          doc(
            db,
            "users",
            currentUser.uid
          ),

          {

            online: false,

            lastSeen:
              serverTimestamp()

          },

          {
            merge: true
          }

        );

      }


      await signOut(auth);

    }

    catch (error) {

      console.error(
        "LOGOUT ERROR:",
        error
      );

    }

  }
);


// ===============================
// BACK BUTTON
// ===============================

backButton.addEventListener(
  "click",
  () => {

    appScreen.classList.remove(
      "chat-open"
    );


    chatBox.classList.add(
      "hidden"
    );


    emptyChat.classList.remove(
      "hidden"
    );


    selectedUser = null;


    if (unsubscribeMessages) {

      unsubscribeMessages();

      unsubscribeMessages = null;

    }

  }
);


// ===============================
// SCROLL MESSAGES
// ===============================

function scrollMessages() {

  messagesBox.scrollTop =
    messagesBox.scrollHeight;

}


// ===============================
// GET INITIALS
// ===============================

function getInitials(name) {

  if (!name) {

    return "U";

  }


  const words =
    name.trim().split(/\s+/);


  if (words.length === 1) {

    return words[0]
      .substring(0, 2)
      .toUpperCase();

  }


  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();

}


// ===============================
// FORMAT TIME
// ===============================

function formatTime(date) {

  if (!date) {

    return "";

  }


  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;

}


// ===============================
// DEFAULT LOGIN SCREEN
// ===============================

nameInput.classList.add("hidden");
