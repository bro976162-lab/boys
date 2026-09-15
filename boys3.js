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
  arrayRemove,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


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
const storage = getStorage(app);


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
const menuDelete = document.getElementById("menuDelete");

// Delete sub-menu
const deleteMenu = document.getElementById("deleteMenu");
const deleteForMe = document.getElementById("deleteForMe");
const deleteForEveryone = document.getElementById("deleteForEveryone");
const deleteCancel = document.getElementById("deleteCancel");

// Sidebar tabs
const chatsTabBtn = document.getElementById("chatsTabBtn");
const statusTabBtn = document.getElementById("statusTabBtn");
const chatsView = document.getElementById("chatsView");
const statusView = document.getElementById("statusView");

// Status
const myStatusCard = document.getElementById("myStatusCard");
const statusMyAvatar = document.getElementById("statusMyAvatar");
const myStatusSub = document.getElementById("myStatusSub");
const statusList = document.getElementById("statusList");

const addStatusModal = document.getElementById("addStatusModal");
const closeAddStatus = document.getElementById("closeAddStatus");
const statusText = document.getElementById("statusText");
const statusImage = document.getElementById("statusImage");
const statusImgName = document.getElementById("statusImgName");
const statusPreview = document.getElementById("statusPreview");
const statusPreviewImg = document.getElementById("statusPreviewImg");
const postStatusBtn = document.getElementById("postStatusBtn");

const statusViewer = document.getElementById("statusViewer");
const statusContent = document.getElementById("statusContent");
const closeViewer = document.getElementById("closeViewer");
const viewerAvatar = document.getElementById("viewerAvatar");
const viewerName = document.getElementById("viewerName");
const viewerTime = document.getElementById("viewerTime");

const statusOwnerBar = document.getElementById("statusOwnerBar");
const statusViewerBar = document.getElementById("statusViewerBar");
const ownerViewersBtn = document.getElementById("ownerViewersBtn");
const ownerLikesBtn = document.getElementById("ownerLikesBtn");
const ownerDeleteBtn = document.getElementById("ownerDeleteBtn");
const viewerCount = document.getElementById("viewerCount");
const likeCount = document.getElementById("likeCount");
const likeStatusBtn = document.getElementById("likeStatusBtn");

const viewersModal = document.getElementById("viewersModal");
const closeViewersModal = document.getElementById("closeViewersModal");
const viewersList = document.getElementById("viewersList");
const viewersModalTitle = document.getElementById("viewersModalTitle");

const toastEl = document.getElementById("toast");


// ==================== STATE ====================
let signupMode = false;
let currentUser = null;
let currentUserData = null;
let selectedUser = null;
let allUsers = [];
let allStatuses = [];
let stopUsers = null;
let stopMessages = null;
let stopSelectedUser = null;
let stopStatuses = null;

let heartbeatInterval = null;
let idleTimer = null;
let isOnline = false;
let activityListenersAttached = false;

let pendingMsg = null;
let pendingStatusImage = null;
let selectedBgColor = "#2563eb";
let currentViewingStatus = null;
let statusTimeout = null;


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
  loadStatuses();

});


// ==================== LOAD PROFILE ====================
async function loadProfile() {

  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {

    currentUserData = snap.data();

    myName.textContent = currentUserData.name || "User";
    myEmail.textContent = currentUserData.email || currentUser.email;
    myAvatar.textContent = initials(currentUserData.name);
    statusMyAvatar.textContent = initials(currentUserData.name);

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

      const deletedFor = message.deletedFor || [];
      if (deletedFor.includes(currentUser.uid)) {
        return;
      }

      const div = document.createElement("div");
      const sent = message.senderId === currentUser.uid;

      div.className = sent ? "message sent" : "message received";
      div.dataset.msgId = msgId;
      div.dataset.sent = sent ? "1" : "0";
      div.dataset.read = message.read ? "1" : "0";

      let time = "";

      if (message.createdAt) {
        time = message.createdAt.toDate().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        });
      }

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

      attachMessageHandlers(div, msgId, message, sent);

      messagesBox.appendChild(div);

    });

    messagesBox.scrollTop = messagesBox.scrollHeight;

    markMessagesAsRead();

  });

}


// ==================== MARK AS READ ====================
async function markMessagesAsRead() {

  if (!currentUser || !selectedUser) return;

  const id = chatId(currentUser.uid, selectedUser.uid);

  const messageEls = messagesBox.querySelectorAll(".message.received");

  if (messageEls.length === 0) return;

  const batch = writeBatch(db);
  let hasUpdates = false;

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

  let pressTimer = null;
  let startX = 0;
  let startY = 0;

  const startPress = (x, y) => {
    startX = x;
    startY = y;
    pressTimer = setTimeout(() => {
      openContextMenu(div, msgId, message, sent, x, y);
    }, 500);
  };

  const cancelPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

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

  div.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    startPress(e.clientX, e.clientY);
  });

  div.addEventListener("mouseup", cancelPress);
  div.addEventListener("mouseleave", cancelPress);

  div.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    openContextMenu(div, msgId, message, sent, e.clientX, e.clientY);
  });

}


// ==================== OPEN CONTEXT MENU ====================
function openContextMenu(div, msgId, message, sent, x, y) {

  if (message.deletedForEveryone) return;

  pendingMsg = {
    id: msgId,
    data: message,
    sent: sent,
    element: div
  };

  if (!sent) {
    deleteForEveryone.style.display = "none";
  } else {
    deleteForEveryone.style.display = "flex";
  }

  msgMenu.classList.remove("hidden");

  const content = msgMenu.querySelector(".msg-menu-content");

  if (window.innerWidth > 700) {

    content.style.position = "fixed";
    content.style.left = "0px";
    content.style.top = "0px";

    const rect = content.getBoundingClientRect();

    let left = x;
    let top = y;

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


function closeContextMenu() {
  msgMenu.classList.add("hidden");
  pendingMsg = null;
}

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
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    showToast("✅ Copied!");
  } catch (err) {
    console.error("Copy error:", err);
    showToast("❌ Copy fail hua");
  }

  closeContextMenu();

});


// ==================== MENU: DELETE ====================
menuDelete.addEventListener("click", () => {
  if (!pendingMsg) return;
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
      { deletedFor: arrayUnion(currentUser.uid) }
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


// ==================== SIDEBAR TABS ====================
chatsTabBtn.addEventListener("click", () => {
  chatsTabBtn.classList.add("active");
  statusTabBtn.classList.remove("active");
  chatsView.classList.remove("hidden");
  statusView.classList.add("hidden");
});

statusTabBtn.addEventListener("click", () => {
  statusTabBtn.classList.add("active");
  chatsTabBtn.classList.remove("active");
  statusView.classList.remove("hidden");
  chatsView.classList.add("hidden");
});


// ==================== TOAST ====================
function showToast(msg) {

  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");

  setTimeout(() => toastEl.classList.add("show"), 10);

  setTimeout(() => {
    toastEl.classList.remove("show");
    setTimeout(() => toastEl.classList.add("hidden"), 300);
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


// ==================== STATUS SYSTEM ====================

// Post status button click
postStatusBtn.addEventListener("click", postStatus);

// My status card click → open add modal
myStatusCard.addEventListener("click", () => {
  openAddStatusModal();
});

// Close add modal
closeAddStatus.addEventListener("click", closeAddStatusModal);

// Background color select
document.querySelectorAll(".bg-color-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".bg-color-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedBgColor = btn.dataset.bg;
  });
});

// Image select
statusImage.addEventListener("change", (e) => {

  const file = e.target.files[0];

  if (!file) {
    pendingStatusImage = null;
    statusPreview.classList.add("hidden");
    statusImgName.textContent = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast("❌ Image 5MB se kam honi chahiye");
    statusImage.value = "";
    return;
  }

  pendingStatusImage = file;
  statusImgName.textContent = file.name;

  const reader = new FileReader();
  reader.onload = (ev) => {
    statusPreviewImg.src = ev.target.result;
    statusPreview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);

});


// Open add status modal
function openAddStatusModal() {

  statusText.value = "";
  statusImage.value = "";
  statusImgName.textContent = "";
  pendingStatusImage = null;
  statusPreview.classList.add("hidden");
  selectedBgColor = "#2563eb";

  document.querySelectorAll(".bg-color-btn").forEach((b) => b.classList.remove("active"));
  const firstBtn = document.querySelector('.bg-color-btn[data-bg="#2563eb"]');
  if (firstBtn) firstBtn.classList.add("active");

  addStatusModal.classList.remove("hidden");

}


// Close add status modal
function closeAddStatusModal() {
  addStatusModal.classList.add("hidden");
  pendingStatusImage = null;
}


// Post status
async function postStatus() {

  if (!currentUser) return;

  const text = statusText.value.trim();

  if (!text && !pendingStatusImage) {
    showToast("❌ Kuch text likho ya photo chuno");
    return;
  }

  postStatusBtn.disabled = true;
  postStatusBtn.textContent = "Posting...";

  try {

    let imageUrl = "";
    let type = "text";

    // Upload image if any
    if (pendingStatusImage) {

      const path = `status/${currentUser.uid}/${Date.now()}_${pendingStatusImage.name}`;
      const fileRef = storageRef(storage, path);

      await uploadBytes(fileRef, pendingStatusImage);
      imageUrl = await getDownloadURL(fileRef);
      type = "image";

    }

    const now = Date.now();

    await addDoc(
      collection(db, "status"),
      {
        userId: currentUser.uid,
        userName: currentUserData?.name || "User",
        userEmail: currentUserData?.email || "",
        text: text,
        imageUrl: imageUrl,
        type: type,
        bgColor: selectedBgColor,
        createdAt: serverTimestamp(),
        expiresAt: now + (24 * 60 * 60 * 1000),
        viewers: [],
        likes: []
      }
    );

    showToast("✅ Status posted!");

    closeAddStatusModal();

  } catch (err) {
    console.error("Post status error:", err);
    showToast("❌ Status post nahi hua");
  }

  postStatusBtn.disabled = false;
  postStatusBtn.textContent = "Post Status";

}


// ==================== LOAD STATUSES ====================
function loadStatuses() {

  if (stopStatuses) stopStatuses();

  const q = query(
    collection(db, "status"),
    orderBy("createdAt", "desc")
  );

  stopStatuses = onSnapshot(q, (snapshot) => {

    const now = Date.now();
    allStatuses = [];

    snapshot.forEach((item) => {

      const data = item.data();

      // Skip expired
      if (data.expiresAt && data.expiresAt < now) return;
      // Skip if createdAt is null (not yet set)
      if (!data.createdAt) return;

      allStatuses.push({
        id: item.id,
        ...data
      });

    });

    showStatuses();

  }, (error) => {
    console.error("Status load error:", error);
    statusList.innerHTML =
      `<p class="loading">Status load nahi ho raha.</p>`;
  });

}


// ==================== SHOW STATUSES ====================
function showStatuses() {

  statusList.innerHTML = "";

  const now = Date.now();

  // Group by userId (latest status per user)
  const grouped = {};

  allStatuses.forEach((s) => {

    if (!grouped[s.userId]) {
      grouped[s.userId] = [];
    }

    grouped[s.userId].push(s);

  });

  // Filter my status
  const otherUsersStatus = Object.keys(grouped).filter(
    (uid) => uid !== currentUser.uid
  );

  // Check my own status
  const myStatuses = grouped[currentUser.uid] || [];

  if (myStatuses.length > 0) {
    myStatusSub.textContent = `${myStatuses.length} update${myStatuses.length > 1 ? "s" : ""} · Tap to view`;
  } else {
    myStatusSub.textContent = "Tap to add status update";
  }

  if (otherUsersStatus.length === 0) {
    statusList.innerHTML =
      `<p class="loading">Abhi koi status nahi hai</p>`;
    return;
  }

  // Sort by latest
  otherUsersStatus.sort((a, b) => {
    const aLatest = grouped[a][0].createdAt?.toDate?.()?.getTime() || 0;
    const bLatest = grouped[b][0].createdAt?.toDate?.()?.getTime() || 0;
    return bLatest - aLatest;
  });

  otherUsersStatus.forEach((uid) => {

    const userStatuses = grouped[uid];
    const latest = userStatuses[0];

    // Check if I have seen this status
    const hasViewed = userStatuses.every((s) =>
      (s.viewers || []).includes(currentUser.uid)
    );

    const div = document.createElement("div");
    div.className = "status-item";

    let timeText = "";
    if (latest.createdAt) {
      const date = latest.createdAt.toDate();
      timeText = timeAgo(date);
    }

    div.innerHTML = `
      <div class="status-ring ${hasViewed ? "viewed" : ""}">
        <div class="status-ring-inner">
          ${initials(latest.userName)}
        </div>
      </div>
      <div class="status-info">
        <strong>${safe(latest.userName || "User")}</strong>
        <small>${timeText}</small>
      </div>
      ${userStatuses.length > 1 ? `<div class="status-badge">${userStatuses.length}</div>` : ""}
    `;

    div.addEventListener("click", () => {
      openStatusViewer(userStatuses, 0);
    });

    statusList.appendChild(div);

  });

}


// ==================== OPEN STATUS VIEWER ====================
function openStatusViewer(statuses, index) {

  if (!statuses || statuses.length === 0) return;

  if (index >= statuses.length) {
    closeStatusViewer();
    return;
  }

  currentViewingStatus = { statuses, index };
  const status = statuses[index];

  const isMine = status.userId === currentUser.uid;

  viewerName.textContent = status.userName || "User";
  viewerAvatar.textContent = initials(status.userName);

  if (status.createdAt) {
    viewerTime.textContent = timeAgo(status.createdAt.toDate());
  }

  // Content
  statusContent.innerHTML = "";

  if (status.type === "image" && status.imageUrl) {
    const img = document.createElement("img");
    img.src = status.imageUrl;
    img.alt = "status";
    statusContent.appendChild(img);
  } else {
    const div = document.createElement("div");
    div.className = "status-text";
    div.style.background = status.bgColor || "#2563eb";
    div.textContent = status.text || "";
    statusContent.appendChild(div);
  }

  // Owner controls
  if (isMine) {
    statusOwnerBar.classList.remove("hidden");
    statusViewerBar.classList.add("hidden");

    viewerCount.textContent = (status.viewers || []).length;
    likeCount.textContent = (status.likes || []).length;
  } else {
    statusOwnerBar.classList.add("hidden");
    statusViewerBar.classList.remove("hidden");

    // Check if liked
    const isLiked = (status.likes || []).includes(currentUser.uid);
    if (isLiked) {
      likeStatusBtn.classList.add("liked");
      likeStatusBtn.textContent = "❤️ Liked";
    } else {
      likeStatusBtn.classList.remove("liked");
      likeStatusBtn.textContent = "❤️ Like";
    }

    // Mark as viewed
    markStatusViewed(status.id);

  }

  // Show viewer
  statusViewer.classList.remove("hidden");

  // Progress bar animation — reset
  const bar = document.getElementById("statusProgress");
  bar.style.animation = "none";
  void bar.offsetWidth;
  bar.style.animation = "";

  // Auto-next after 5 sec
  if (statusTimeout) clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    nextStatus();
  }, 5000);

}


// Close status viewer
function closeStatusViewer() {

  if (statusTimeout) {
    clearTimeout(statusTimeout);
    statusTimeout = null;
  }

  statusViewer.classList.add("hidden");
  currentViewingStatus = null;

}


// Next status
function nextStatus() {

  if (!currentViewingStatus) return;

  const { statuses, index } = currentViewingStatus;

  if (index + 1 < statuses.length) {
    openStatusViewer(statuses, index + 1);
  } else {
    closeStatusViewer();
  }

}


// Close viewer button
closeViewer.addEventListener("click", closeStatusViewer);

// Click on status content to skip to next
statusContent.addEventListener("click", () => {
  nextStatus();
});


// ==================== MARK STATUS VIEWED ====================
async function markStatusViewed(statusId) {

  try {

    const ref = doc(db, "status", statusId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    const viewers = data.viewers || [];

    if (viewers.includes(currentUser.uid)) return;

    await updateDoc(ref, {
      viewers: arrayUnion(currentUser.uid)
    });

  } catch (err) {
    console.error("Mark viewed error:", err);
  }

}


// ==================== LIKE STATUS ====================
likeStatusBtn.addEventListener("click", async () => {

  if (!currentViewingStatus) return;

  const { statuses, index } = currentViewingStatus;
  const status = statuses[index];

  if (status.userId === currentUser.uid) return;

  const statusId = status.id;
  const isLiked = (status.likes || []).includes(currentUser.uid);

  try {

    const ref = doc(db, "status", statusId);

    if (isLiked) {
      await updateDoc(ref, {
        likes: arrayRemove(currentUser.uid)
      });
      showToast("💔 Like removed");
    } else {
      await updateDoc(ref, {
        likes: arrayUnion(currentUser.uid)
      });
      showToast("❤️ Liked!");
    }

  } catch (err) {
    console.error("Like error:", err);
  }

});


// ==================== VIEWERS / LIKES MODAL ====================
ownerViewersBtn.addEventListener("click", () => {
  showViewersModal("viewers");
});

ownerLikesBtn.addEventListener("click", () => {
  showViewersModal("likes");
});

closeViewersModal.addEventListener("click", () => {
  viewersModal.classList.add("hidden");
});


async function showViewersModal(type) {

  if (!currentViewingStatus) return;

  const { statuses, index } = currentViewingStatus;
  const status = statuses[index];

  const uids = type === "viewers"
    ? (status.viewers || [])
    : (status.likes || []);

  viewersModalTitle.textContent = type === "viewers"
    ? `Viewers (${uids.length})`
    : `Likes (${uids.length})`;

  viewersList.innerHTML =
    `<p class="loading">Loading...</p>`;

  viewersModal.classList.remove("hidden");

  if (uids.length === 0) {
    viewersList.innerHTML =
      `<p class="loading">Abhi koi ${type === "viewers" ? "viewer" : "like"} nahi hai</p>`;
    return;
  }

  viewersList.innerHTML = "";

  for (const uid of uids) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        const div = document.createElement("div");
        div.className = "viewer-item";
        div.innerHTML = `
          <div class="avatar">${initials(data.name)}</div>
          <div class="viewer-item-info">
            <strong>${safe(data.name || "User")}</strong>
            <small>${safe(data.email || "")}</small>
          </div>
        `;
        viewersList.appendChild(div);
      }
    } catch (err) {
      console.error("Load viewer error:", err);
    }
  }

}


// ==================== OWNER DELETE STATUS ====================
ownerDeleteBtn.addEventListener("click", async () => {

  if (!currentViewingStatus) return;

  const { statuses, index } = currentViewingStatus;
  const status = statuses[index];

  if (status.userId !== currentUser.uid) {
    showToast("❌ Ye aapka status nahi hai");
    return;
  }

  const confirmDelete = confirm("Ye status delete karna hai?");
  if (!confirmDelete) return;

  try {

    const { deleteDoc } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js");

    await deleteDoc(doc(db, "status", status.id));
    showToast("✅ Status deleted");
    closeStatusViewer();

  } catch (err) {
    console.error("Delete status error:", err);
    showToast("❌ Delete fail hua");
  }

});


// ==================== CLICK OUTSIDE MODALS ====================
addStatusModal.addEventListener("click", (e) => {
  if (e.target === addStatusModal) closeAddStatusModal();
});

viewersModal.addEventListener("click", (e) => {
  if (e.target === viewersModal) viewersModal.classList.add("hidden");
});


// ==================== START ====================
nameInput.classList.add("hidden");
