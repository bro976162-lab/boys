alert("SCRIPT CHAL RAHA HAI");

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
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==================== FIREBASE ====================
const firebaseConfig = {
  apiKey: "AIzaSyCUhCfOlm0fk7omOwqcg7y3xkX77_xDrFI",
  authDomain: "boys-c950b.firebaseapp.com",
  projectId: "boys-c950b",
  storageBucket: "boys-c950b.firebasestorage.app",
  messagingSenderId: "182409162273",
  appId: "1:182409162273:web:ed5d49b560e400e889fd60",
  measurementId: "G-LRCQV0CESH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ==================== ELEMENTS ====================
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


// ==================== STATE ====================
let signupMode = false;
let currentUser = null;
let selectedUser = null;
let allUsers = [];
let stopUsers = null;
let stopMessages = null;
let stopSelectedUser = null;

let presenceInterval = null;
let heartbeatInterval = null;
let idleTimer = null;
let isOnline = false;
let activityListenersAttached = false;


// ==================== LOGIN TAB ====================
loginTab.addEventListener("click", () => {

  signupMode = false;

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  nameInput.classList.add("hidden");

  authButton.textContent = "Login";
  authMessage.textContent = "";

});


// ==================== SIGNUP TAB ====================
signupTab.addEventListener("click", () => {

  signupMode = true;

  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  nameInput.classList.remove("hidden");

  authButton.textContent = "Sign Up";
  authMessage.textContent = "";

});


// ==================== LOGIN / SIGNUP BUTTON ====================
authButton.addEventListener("click", async () => {

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  authMessage.textContent = "";

  if (signupMode && name.length < 2) {
    authMessage.textContent = "Please enter your name.";
    return;
  }

  if (!email) {
    authMessage.textContent = "Please enter your email.";
    return;
  }

  if (password.length < 6) {
    authMessage.textContent = "Password must be at least 6 characters.";
    return;
  }

  authButton.disabled = true;

  try {

    if (signupMode) {

      const result = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(
        doc(db, "users", result.user.uid),
        {
          uid: result.user.uid,
          name: name,
          email: email,
          online: true,
          lastSeen: serverTimestamp(),
          createdAt: serverTimestamp()
        }
      );

      authMessage.textContent = "Account created successfully.";

    } else {

      await signInWithEmailAndPassword(auth, email, password);

    }

  } catch (error) {

    console.error(error);

    if (error.code === "auth/email-already-in-use") {
      authMessage.textContent = "This email is already registered.";
    }
    else if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      authMessage.textContent = "Email or password is incorrect.";
    }
    else if (error.code === "auth/invalid-email") {
      authMessage.textContent = "Invalid email address.";
    }
    else if (error.code === "auth/weak-password") {
      authMessage.textContent = "Password must be at least 6 characters.";
    }
    else if (error.code === "auth/operation-not-allowed") {
      authMessage.textContent = "Firebase Email/Password is not enabled.";
    }
    else {
      authMessage.textContent = error.message;
    }

  }

  authButton.disabled = false;

});


// ==================== AUTH STATE ====================
onAuthStateChanged(auth, async (user) => {

  if (!user) {

    currentUser = null;

    authScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");

    stopPresence();

    return;
  }

  currentUser = user;

  authScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");

  await loadProfile();

  // Online karo
  await setUserOnline(true);

  // Presence system start
  startPresence();

  loadUsers();

});


// ==================== LOAD PROFILE ====================
async function loadProfile() {

  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {

    const data = snap.data();

    myName.textContent = data.name || "User";
    myEmail.textContent = data.email || currentUser.email;
    myAvatar.textContent = initials(data.name);

  }

}


// ==================== PRESENCE SYSTEM ====================
async function setUserOnline(status) {

  if (!currentUser) return;

  isOnline = status;

  try {

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        online: status,
        lastSeen: serverTimestamp()
      },
      { merge: true }
    );

    if (myStatus) {
      myStatus.textContent = status ? "Online" : "Offline";
    }

  } catch (err) {
    console.error("Presence error:", err);
  }

}


function startPresence() {

  stopPresence();

  // Heartbeat - har 30 sec
  heartbeatInterval = setInterval(() => {

    if (isOnline && currentUser) {

      setDoc(
        doc(db, "users", currentUser.uid),
        {
          online: true,
          lastSeen: serverTimestamp()
        },
        { merge: true }
      ).catch(console.error);

    }

  }, 30000);


  // Idle detection
  const resetIdleTimer = () => {

    if (idleTimer) clearTimeout(idleTimer);

    if (!isOnline && currentUser) {
      setUserOnline(true);
    }

    idleTimer = setTimeout(() => {
      if (currentUser) {
        setUserOnline(false);
      }
    }, 5 * 60 * 1000); // 5 min

  };


  // Activity events (ek hi baar attach karo)
  if (!activityListenersAttached) {

    ["mousemove", "keydown", "click", "touchstart", "scroll"]
      .forEach((event) => {
        document.addEventListener(event, resetIdleTimer);
      });

    // Tab close / hide
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    // Tab visibility
    document.addEventListener("visibilitychange", () => {

      if (!currentUser) return;

      if (document.hidden) {
        setUserOnline(false);
      } else {
        setUserOnline(true);
      }

    });

    activityListenersAttached = true;

  }

  resetIdleTimer();

}


function stopPresence() {

  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }

}


function handleUnload() {

  if (!currentUser) return;

  setDoc(
    doc(db, "users", currentUser.uid),
    {
      online: false,
      lastSeen: serverTimestamp()
    },
    { merge: true }
  );

}


// ==================== LOAD USERS ====================
function loadUsers() {

  if (stopUsers) stopUsers();

  const q = collection(db, "users");

  stopUsers = onSnapshot(q, (snapshot) => {

    allUsers = [];

    snapshot.forEach((item) => {

      const user = item.data();

      if (user.uid !== currentUser.uid) {
        allUsers.push(user);
      }

    });

    // Client side sorting
    allUsers.sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );

    showUsers(allUsers);

  }, (error) => {

    console.error(error);

    usersList.innerHTML =
      `<p class="loading">Users load nahi ho rahe.</p>`;

  });

}


// ==================== SHOW USERS ====================
function showUsers(users) {

  usersList.innerHTML = "";

  if (users.length === 0) {

    usersList.innerHTML =
      `<p class="loading">Abhi koi other user nahi mila.</p>`;

    return;
  }

  users.forEach((user) => {

    let statusText = "";

    if (user.online) {
      statusText = "Online";
    } else if (user.lastSeen) {

      const date = user.lastSeen.toDate
        ? user.lastSeen.toDate()
        : new Date(user.lastSeen);

      statusText = "Last seen " + timeAgo(date);

    } else {
      statusText = "Offline";
    }

    const div = document.createElement("div");
    div.className = "user-item";

    div.innerHTML = `
      <div class="avatar">
        ${initials(user.name)}
      </div>

      <div class="user-info">
        <strong>${safe(user.name || "User")}</strong>
        <span>${statusText}</span>
      </div>

      ${user.online ? `<div class="online-dot"></div>` : ""}
    `;

    div.addEventListener("click", () => openChat(user));

    usersList.appendChild(div);

  });

}


// ==================== SEARCH ====================
searchInput.addEventListener("input", () => {

  const text = searchInput.value.toLowerCase().trim();

  const result = allUsers.filter((user) =>
    (user.name || "").toLowerCase().includes(text)
  );

  showUsers(result);

});


// ==================== OPEN CHAT ====================
function openChat(user) {

  selectedUser = user;

  emptyChat.classList.add("hidden");
  chatBox.classList.remove("hidden");

  appScreen.classList.add("chat-open");

  chatName.textContent = user.name || "User";
  chatAvatar.textContent = initials(user.name);

  updateChatStatus(user);

  listenToSelectedUser(user.uid);

  loadMessages();

}


// Live status of selected user
function listenToSelectedUser(uid) {

  if (stopSelectedUser) {
    stopSelectedUser();
    stopSelectedUser = null;
  }

  stopSelectedUser = onSnapshot(
    doc(db, "users", uid),
    (snap) => {

      if (!snap.exists()) return;

      const data = snap.data();

      selectedUser = { ...selectedUser, ...data };

      updateChatStatus(data);

    }
  );

}


function updateChatStatus(user) {

  if (user.online) {
    chatStatus.textContent = "Online";
    chatStatus.style.color = "#22a447";
  } else if (user.lastSeen) {

    const date = user.lastSeen.toDate
      ? user.lastSeen.toDate()
      : new Date(user.lastSeen);

    chatStatus.textContent = "Last seen " + timeAgo(date);
    chatStatus.style.color = "#888";

  } else {
    chatStatus.textContent = "Offline";
    chatStatus.style.color = "#888";
  }

}


// ==================== CHAT ID ====================
function chatId(a, b) {
  return [a, b].sort().join("_");
}


// ==================== LOAD MESSAGES ====================
function loadMessages() {

  if (stopMessages) {
    stopMessages();
    stopMessages = null;
  }

  messagesBox.innerHTML = "";

  const id = chatId(currentUser.uid, selectedUser.uid);

  const q = query(
    collection(db, "chats", id, "messages"),
    orderBy("createdAt")
  );

  stopMessages = onSnapshot(q, (snapshot) => {

    messagesBox.innerHTML = "";

    snapshot.forEach((item) => {

      const message = item.data();

      const div = document.createElement("div");

      const sent = message.senderId === currentUser.uid;

      div.className = sent ? "message sent" : "message received";

      let time = "";

      if (message.createdAt) {
        time = message.createdAt.toDate().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        });
      }

      div.innerHTML = `
        ${safe(message.text || "")}
        <span class="message-time">
          ${time}
          ${sent ? " ✓" : ""}
        </span>
      `;

      messagesBox.appendChild(div);

    });

    messagesBox.scrollTop = messagesBox.scrollHeight;

  });

}


// ==================== SEND MESSAGE ====================
sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});


async function sendMessage() {

  if (!currentUser || !selectedUser) return;

  const text = messageInput.value.trim();

  if (!text) return;

  const id = chatId(currentUser.uid, selectedUser.uid);

  await addDoc(
    collection(db, "chats", id, "messages"),
    {
      senderId: currentUser.uid,
      receiverId: selectedUser.uid,
      text: text,
      createdAt: serverTimestamp(),
      read: false
    }
  );

  messageInput.value = "";

}


// ==================== LOGOUT ====================
logoutButton.addEventListener("click", async () => {

  if (currentUser) {

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        online: false,
        lastSeen: serverTimestamp()
      },
      { merge: true }
    );

  }

  stopPresence();

  await signOut(auth);

});


// ==================== BACK ====================
backButton.addEventListener("click", () => {

  selectedUser = null;

  appScreen.classList.remove("chat-open");

  chatBox.classList.add("hidden");
  emptyChat.classList.remove("hidden");

  if (stopMessages) {
    stopMessages();
    stopMessages = null;
  }

  if (stopSelectedUser) {
    stopSelectedUser();
    stopSelectedUser = null;
  }

});


// ==================== HELPERS ====================
function initials(name) {

  if (!name) return "U";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();

}


function safe(text) {

  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;

}


function timeAgo(date) {

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 10) return "just now";
  if (seconds < 60) return seconds + " sec ago";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + " min ago";

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + " hour" + (hours > 1 ? "s" : "") + " ago";

  const days = Math.floor(hours / 24);
  if (days < 7) return days + " day" + (days > 1 ? "s" : "") + " ago";

  return date.toLocaleDateString();

}


// ==================== START ====================
nameInput.classList.add("hidden");
