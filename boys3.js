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
  serverTimestamp,
  updateDoc,
  arrayUnion,
  writeBatch
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

// Context menu
const msgMenu = document.getElementById("msgMenu");
const menuCopy = document.getElementById("menuCopy");
const menuSelect = document.getElementById("menuSelect");
const menuDelete = document.getElementById("menuDelete");

// Delete sub-menu
const deleteMenu = document.getElementById("deleteMenu");
const deleteForMe = document.getElementById("deleteForMe");
const deleteForEveryone = document.getElementById("deleteForEveryone");
const deleteCancel = document.getElementById("deleteCancel");


// ==================== STATE ====================
let signupMode = false;
let currentUser = null;
let selectedUser = null;
let allUsers = [];
let stopUsers = null;
let stopMessages = null;
let stopSelectedUser = null;

let heartbeatInterval = null;
let idleTimer = null;
let isOnline = false;
let activityListenersAttached = false;

let pendingMsg = null;
let selectedMessages = new Set();
let isSelectMode = false;


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


// ==================== LOGIN / SIGNUP ====================
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
  await setUserOnline(true);
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


// ==================== PRESENCE ====================
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


  const resetIdleTimer = () => {

    if (idleTimer) clearTimeout(idleTimer);

    if (!isOnline && currentUser) {
      setUserOnline(true);
    }

    idleTimer = setTimeout(() => {
      if (currentUser) {
        setUserOnline(false);
      }
    }, 5 * 60 * 1000);

  };


  if (!activityListenersAttached) {

    ["mousemove", "keydown", "click", "touchstart", "scroll"]
      .forEach((event) => {
        document.addEventListener(event, resetIdleTimer);
      });

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

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

    const messages = [];

    snapshot.forEach((item) => {
      messages.push({
        id: item.id,
        data: item.data()
      });
    });

    messages.forEach(({ id: msgId, data: message }) => {

      // Delete for me filter
      const deletedFor = message.deletedFor || [];
      if (deletedFor.includes(currentUser.uid)) {
        return;
      }

      const div = document.createElement("div");
      const sent = message.senderId === currentUser.uid;

      div.className = sent ? "message sent" : "message received";
      div.dataset.msgId = msgId;
      div.dataset.sent = sent ? "1" : "0";

      let time = "";

      if (message.createdAt) {
        time = message.createdAt.toDate().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        });
      }

      // Ticks sirf apne bheje messages pe
      let tickHTML = "";

      if (sent && !message.deletedForEveryone) {

        if (message.read) {
          tickHTML = `<span class="tick double read">✓✓</span>`;
        } else {
          tickHTML = `<span class="tick double">✓✓</span>`;
        }

      }

      if (message.deletedForEveryone) {
        div.classList.add("deleted");
        div.innerHTML = `
          <em>🚫 Ye message delete kar diya gaya</em>
          <span class="message-time">${time}</span>
        `;
      } else {
        div.innerHTML = `
          <span class="msg-text">${safe(message.text || "")}</span>
          <span class="message-time">
            ${time}
            ${tickHTML}
          </span>
        `;
      }

      // Long press / right click handler
      attachMessageHandlers(div, msgId, message, sent);

      messagesBox.appendChild(div);

    });

    messagesBox.scrollTop = messagesBox.scrollHeight;

    // 🔥 Read receipts — jo messages receiver ne nahi padhe, unko read mark karo
    markMessagesAsRead();

  });

}


// ==================== MARK AS READ ====================
async function markMessagesAsRead() {

  if (!currentUser || !selectedUser) return;

  const id = chatId(currentUser.uid, selectedUser.uid);

  try {

    const q = query(
      collection(db, "chats", id, "messages"),
      orderBy("createdAt")
    );

    const snapshot = await new Promise((resolve, reject) => {
      // one-time get
      const { getDocs } = window.firebaseHelpers || {};
      // Use onSnapshot once but we need getDocs. Let's import dynamically.
      resolve(null);
    });

  } catch (err) {
    // ignore
  }

  // Simpler: iterate messagesBox children
  const messageEls = messagesBox.querySelectorAll(".message.received");

  if (messageEls.length === 0) return;

  const batch = writeBatch(db);

  let hasUpdates = false;

  messageEls.forEach((el) => {

    const msgId = el.dataset.msgId;

    // Check karo agar ye already read hai to skip
    // Hum data attributes store kar sakte hain — but easier: read from snapshot
    // Use simple approach: update all received unread

  });

  // Alternative simpler: directly update all received messages where read=false
  // We'll do it by iterating our cached messages
  // But since we don't have cache, let's attach read status via dataset

  messageEls.forEach((el) => {

    if (el.dataset.read === "1") return;

    const msgId = el.dataset.msgId;

    batch.update(
      doc(db, "chats", id, "messages", msgId),
      { read: true, readAt: serverTimestamp() }
    );

    hasUpdates = true;

  });

  if (hasUpdates) {
    try {
      await batch.commit();
    } catch (err) {
      console.error("Read update error:", err);
    }
  }

}


// ==================== MESSAGE HANDLERS ====================
function attachMessageHandlers(div, msgId, message, sent) {

  // Store read status in dataset for markMessagesAsRead
  if (message.read) {
    div.dataset.read = "1";
  } else {
    div.dataset.read = "0";
  }

  let pressTimer = null;
  let longPressed = false;
  let startX = 0;
  let startY = 0;

  const startPress = (x, y) => {

    longPressed = false;
    startX = x;
    startY = y;

    pressTimer = setTimeout(() => {
      longPressed = true;
      openContextMenu(div, msgId, message, sent, x, y);
    }, 500);

  };

  const cancelPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  // Mobile: touch
  div.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    startPress(t.clientX, t.clientY);
  }, { passive: true });

  div.addEventListener("touchend", cancelPress);
  div.addEventListener("touchcancel", cancelPress);

  div.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - startX);
    const dy = Math.abs(t.clientY - startY);
    if (dx > 10 || dy > 10) cancelPress();
  });

  // Desktop: mouse hold
  div.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    startPress(e.clientX, e.clientY);
  });

  div.addEventListener("mouseup", cancelPress);
  div.addEventListener("mouseleave", cancelPress);

  // Desktop: right click
  div.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    openContextMenu(div, msgId, message, sent, e.clientX, e.clientY);
  });

}


// ==================== OPEN CONTEXT MENU ====================
function openContextMenu(div, msgId, message, sent, x, y) {

  // Agar delete-for-everyone hai to menu na dikhao
  if (message.deletedForEveryone) {
    return;
  }

  // Agar select mode me hai to select toggle karo
  if (isSelectMode) {
    toggleSelect(div, msgId);
    return;
  }

  pendingMsg = {
    id: msgId,
    data: message,
    sent: sent,
    element: div
  };

  // "Delete for everyone" option sirf apne messages pe
  if (!sent) {
    deleteForEveryone.style.display = "none";
  } else {
    deleteForEveryone.style.display = "flex";
  }

  msgMenu.classList.remove("hidden");

  const content = msgMenu.querySelector(".msg-menu-content");

  // Desktop: position at cursor
  if (window.innerWidth > 700) {

    content.style.position = "fixed";

    // Reset pehle
    content.style.left = "0px";
    content.style.top = "0px";

    const rect = content.getBoundingClientRect();

    let left = x;
    let top = y;

    // Screen se bahar na jaye
    if (left + rect.width > window.innerWidth - 10) {
      left = window.innerWidth - rect.width - 10;
    }

    if (top + rect.height > window.innerHeight - 10) {
      top = window.innerHeight - rect.height - 10;
    }

    content.style.left = left + "px";
    content.style.top = top + "px";

  }

}


// ==================== CLOSE CONTEXT MENU ====================
function closeContextMenu() {
  msgMenu.classList.add("hidden");
  pendingMsg = null;
}

// Click outside
msgMenu.addEventListener("click", (e) => {
  if (e.target === msgMenu || e.target.classList.contains("msg-menu-content")) {
    closeContextMenu();
  }
});


// ==================== MENU: COPY ====================
menuCopy.addEventListener("click", async () => {

  if (!pendingMsg) return;

  const text = pendingMsg.data.text || "";

  try {

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    // Feedback
    showToast("✅ Copied!");

  } catch (err) {
    console.error("Copy error:", err);
    showToast("❌ Copy fail hua");
  }

  closeContextMenu();

});


// ==================== MENU: SELECT ====================
menuSelect.addEventListener("click", () => {

  if (!pendingMsg) return;

  isSelectMode = true;
  selectedMessages.clear();

  if (pendingMsg.element) {
    toggleSelect(pendingMsg.element, pendingMsg.id);
  }

  closeContextMenu();

  showToast("Select mode ON — message pe tap karo");

});


function toggleSelect(div, msgId) {

  if (selectedMessages.has(msgId)) {
    selectedMessages.delete(msgId);
    div.classList.remove("selected");
  } else {
    selectedMessages.add(msgId);
    div.classList.add("selected");
  }

  // Agar koi message select nahi raha to select mode off
  if (selectedMessages.size === 0) {
    isSelectMode = false;
  }

}


// ==================== MENU: DELETE ====================
menuDelete.addEventListener("click", () => {

  if (!pendingMsg) return;

  // Delete sub-menu kholo
  msgMenu.classList.add("hidden");
  deleteMenu.classList.remove("hidden");

});


// ==================== DELETE FOR ME ====================
deleteForMe.addEventListener("click", async () => {

  if (!pendingMsg) return;

  const { id } = pendingMsg;
  const id_chat = chatId(currentUser.uid, selectedUser.uid);

  try {

    await updateDoc(
      doc(db, "chats", id_chat, "messages", id),
      {
        deletedFor: arrayUnion(currentUser.uid)
      }
    );

  } catch (err) {
    console.error("Delete for me error:", err);
    showToast("❌ Delete fail hua");
  }

  closeDeleteMenu();

});


// ==================== DELETE FOR EVERYONE ====================
deleteForEveryone.addEventListener("click", async () => {

  if (!pendingMsg) return;

  const { id, sent } = pendingMsg;

  if (!sent) {
    showToast("Sirf apne message ko delete for everyone kar sakte ho");
    closeDeleteMenu();
    return;
  }

  const id_chat = chatId(currentUser.uid, selectedUser.uid);

  try {

    await updateDoc(
      doc(db, "chats", id_chat, "messages", id),
      {
        deletedForEveryone: true,
        text: "",
        deletedAt: serverTimestamp()
      }
    );

  } catch (err) {
    console.error("Delete for everyone error:", err);
    showToast("❌ Delete fail hua");
  }

  closeDeleteMenu();

});


// ==================== DELETE CANCEL ====================
deleteCancel.addEventListener("click", closeDeleteMenu);

deleteMenu.addEventListener("click", (e) => {
  if (e.target === deleteMenu || e.target.classList.contains("msg-menu-content")) {
    closeDeleteMenu();
  }
});


function closeDeleteMenu() {
  deleteMenu.classList.add("hidden");
  pendingMsg = null;
}


// ==================== SEND MESSAGE ====================
sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});


async function sendMessage() {

  if (!currentUser || !selectedUser) return;

  const text = messageInput.value.trim();

  if (!text) return;

  const id = chatId(currentUser.uid, selectedUser.uid);

  try {

    await addDoc(
      collection(db, "chats", id, "messages"),
      {
        senderId: currentUser.uid,
        receiverId: selectedUser.uid,
        text: text,
        createdAt: serverTimestamp(),
        read: false,
        deletedFor: [],
        deletedForEveryone: false
      }
    );

    messageInput.value = "";

    messagesBox.scrollTop = messagesBox.scrollHeight;

  } catch (err) {
    console.error("Send error:", err);
    showToast("❌ Message send nahi hua");
  }

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

  closeContextMenu();
  closeDeleteMenu();

});


// ==================== TOAST ====================
function showToast(msg) {

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);

}


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
