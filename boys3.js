// ==================== SUPABASE ====================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ⚠️ YAHAN APNA SUPABASE URL AUR ANON KEY DAALO
const SUPABASE_URL = "https://uqeeelnmmnkaosxvmoxb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxZWVlbG5tbW5rYW9zeHZtb3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0ODUxMDIsImV4cCI6MjEwNTA2MTEwMn0.I0VEgwZR7GSnBlVOMbH8vFqvRFcJ-sIxIb4KFQITNXo";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (SUPABASE_URL.includes("YOUR_SUPABASE")) {
  alert("⚠️ Pehle boys3.js me apna Supabase URL aur Anon Key daalo!");
}


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

const msgMenu = document.getElementById("msgMenu");
const menuCopy = document.getElementById("menuCopy");
const menuDelete = document.getElementById("menuDelete");

const deleteMenu = document.getElementById("deleteMenu");
const deleteForMe = document.getElementById("deleteForMe");
const deleteForEveryone = document.getElementById("deleteForEveryone");
const deleteCancel = document.getElementById("deleteCancel");

const chatsTabBtn = document.getElementById("chatsTabBtn");
const statusTabBtn = document.getElementById("statusTabBtn");
const chatsView = document.getElementById("chatsView");
const statusView = document.getElementById("statusView");

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

const toastEl = document.getElementById("toast") || document.createElement("div");
if (!document.getElementById("toast")) {
  toastEl.id = "toast";
  toastEl.className = "toast hidden";
  document.body.appendChild(toastEl);
}


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

let currentChatId = null;

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


// ==================== AUTH ERROR MAPPER ====================
function authErrorMessage(error) {
  const msg = (error?.message || "").toLowerCase();
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "This email is already registered.";
  }
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "Email or password is incorrect.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email first.";
  }
  if (msg.includes("invalid email")) {
    return "Invalid email address.";
  }
  if (msg.includes("password should be at least")) {
    return "Password must be at least 6 characters.";
  }
  if (msg.includes("rate limit")) {
    return "Too many attempts. Please try again later.";
  }
  return error?.message || "Something went wrong.";
}


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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name } }
      });

      if (error) throw error;

      if (!data.session) {
        authMessage.style.color = "#16a34a";
        authMessage.textContent = "Account created. Check your email to confirm.";
      } else {
        authMessage.style.color = "#16a34a";
        authMessage.textContent = "Account created successfully.";
      }

    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }

  } catch (error) {
    console.error(error);
    authMessage.style.color = "#e11d48";
    authMessage.textContent = authErrorMessage(error);
  }

  authButton.disabled = false;
});


// ==================== AUTH STATE ====================
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("Auth event:", event);

  if (session?.user) {
    if (!currentUser || currentUser.id !== session.user.id) {
      await handleSignedIn(session.user);
    }
  } else {
    if (currentUser) handleSignedOut();
  }
});


async function handleSignedIn(user) {
  currentUser = user;

  authScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");

  await loadProfile();
  await setUserOnline(true);
  startPresence();
  loadUsers();
  loadStatuses();
}


function handleSignedOut() {
  currentUser = null;
  currentUserData = null;
  selectedUser = null;

  authScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");

  stopPresence();

  if (stopUsers) { stopUsers(); stopUsers = null; }
  if (stopMessages) { stopMessages(); stopMessages = null; }
  if (stopSelectedUser) { stopSelectedUser(); stopSelectedUser = null; }
  if (stopStatuses) { stopStatuses(); stopStatuses = null; }
}


// ==================== LOAD PROFILE ====================
async function loadProfile() {
  let { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("uid", currentUser.id)
    .maybeSingle();

  // Agar row nahi mila (trigger fail hua) to create kar do
  if (!data) {
    const name = currentUser.user_metadata?.name
      || (currentUser.email || "").split("@")[0]
      || "User";

    await supabase.from("users").insert({
      uid: currentUser.id,
      name: name,
      email: currentUser.email,
      online: true,
      last_seen: new Date().toISOString()
    });

    const retry = await supabase
      .from("users")
      .select("*")
      .eq("uid", currentUser.id)
      .maybeSingle();

    data = retry.data;
  }

  if (data) {
    currentUserData = data;
    myName.textContent = data.name || "User";
    myEmail.textContent = data.email || currentUser.email;
    myAvatar.textContent = initials(data.name);
    statusMyAvatar.textContent = initials(data.name);
  }
}


// ==================== PRESENCE ====================
async function setUserOnline(status) {
  if (!currentUser) return;
  isOnline = status;

  try {
    await supabase
      .from("users")
      .update({
        online: status,
        last_seen: new Date().toISOString()
      })
      .eq("uid", currentUser.id);

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
      supabase
        .from("users")
        .update({
          online: true,
          last_seen: new Date().toISOString()
        })
        .eq("uid", currentUser.id)
        .then(() => {}, console.error);
    }
  }, 30000);

  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);

    if (!isOnline && currentUser) setUserOnline(true);

    idleTimer = setTimeout(() => {
      if (currentUser) setUserOnline(false);
    }, 5 * 60 * 1000);
  };

  if (!activityListenersAttached) {
    ["mousemove", "keydown", "click", "touchstart", "scroll"].forEach((event) => {
      document.addEventListener(event, resetIdleTimer);
    });

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    document.addEventListener("visibilitychange", () => {
      if (!currentUser) return;
      if (document.hidden) setUserOnline(false);
      else setUserOnline(true);
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
  // Best-effort (async, browser band hone se pehle complete ho ya na ho)
  supabase
    .from("users")
    .update({ online: false, last_seen: new Date().toISOString() })
    .eq("uid", currentUser.id)
    .then(() => {}, () => {});
}


// ==================== LOAD USERS ====================
async function loadUsers() {
  if (stopUsers) { stopUsers(); stopUsers = null; }

  await refreshUsers();

  const channel = supabase
    .channel("users-rt-" + Date.now())
    .on("postgres_changes",
      { event: "*", schema: "public", table: "users" },
      () => refreshUsers()
    )
    .subscribe();

  stopUsers = () => supabase.removeChannel(channel);
}


async function refreshUsers() {
  if (!currentUser) return;

  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error(error);
    usersList.innerHTML = `<p class="loading">Users load nahi ho rahe.</p>`;
    return;
  }

  allUsers = (data || []).filter((u) => u.uid !== currentUser.id);
  allUsers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  showUsers(allUsers);
}


// ==================== SHOW USERS ====================
function showUsers(users) {
  usersList.innerHTML = "";

  if (users.length === 0) {
    usersList.innerHTML = `<p class="loading">Abhi koi other user nahi mila.</p>`;
    return;
  }

  users.forEach((user) => {
    let statusText = "";

    if (user.online) {
      statusText = "Online";
    } else if (user.last_seen) {
      statusText = "Last seen " + timeAgo(new Date(user.last_seen));
    } else {
      statusText = "Offline";
    }

    const div = document.createElement("div");
    div.className = "user-item";

    div.innerHTML = `
      <div class="avatar">${initials(user.name)}</div>
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
  if (stopSelectedUser) { stopSelectedUser(); stopSelectedUser = null; }

  const channel = supabase
    .channel("user-" + uid + "-" + Date.now())
    .on("postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "users",
        filter: `uid=eq.${uid}`
      },
      (payload) => {
        selectedUser = { ...selectedUser, ...payload.new };
        updateChatStatus(payload.new);
      }
    )
    .subscribe();

  stopSelectedUser = () => supabase.removeChannel(channel);
}


function updateChatStatus(user) {
  if (user.online) {
    chatStatus.textContent = "Online";
    chatStatus.style.color = "#22a447";
  } else if (user.last_seen) {
    chatStatus.textContent = "Last seen " + timeAgo(new Date(user.last_seen));
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
  if (stopMessages) { stopMessages(); stopMessages = null; }

  currentChatId = chatId(currentUser.id, selectedUser.uid);
  messagesBox.innerHTML = "";

  refreshMessages();

  const channel = supabase
    .channel("msgs-" + currentChatId + "-" + Date.now())
    .on("postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `chat_id=eq.${currentChatId}`
      },
      () => refreshMessages()
    )
    .subscribe();

  stopMessages = () => supabase.removeChannel(channel);
}


async function refreshMessages() {
  if (!currentUser || !selectedUser || !currentChatId) return;

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", currentChatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Load messages error:", error);
    return;
  }

  renderMessages(data || []);
}


function renderMessages(messages) {
  messagesBox.innerHTML = "";

  messages.forEach((message) => {
    const deletedFor = message.deleted_for || [];
    if (deletedFor.includes(currentUser.id)) return;

    const msgId = message.id;
    const sent = message.sender_id === currentUser.id;

    const div = document.createElement("div");
    div.className = sent ? "message sent" : "message received";
    div.dataset.msgId = msgId;
    div.dataset.sent = sent ? "1" : "0";
    div.dataset.read = message.read ? "1" : "0";

    let time = "";
    if (message.created_at) {
      time = new Date(message.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    let tickHTML = "";
    if (sent && !message.deleted_for_everyone) {
      tickHTML = message.read
        ? `<span class="tick double read">✓✓</span>`
        : `<span class="tick double">✓✓</span>`;
    }

    if (message.deleted_for_everyone) {
      div.classList.add("deleted");
      div.innerHTML = `
        <em>🚫 Ye message delete kar diya gaya</em>
        <span class="message-time">${time}</span>
      `;
    } else {
      div.innerHTML = `
        <span class="msg-text">${safe(message.text || "")}</span>
        <span class="message-time">${time}${tickHTML}</span>
      `;
    }

    attachMessageHandlers(div, msgId, message, sent);
    messagesBox.appendChild(div);
  });

  messagesBox.scrollTop = messagesBox.scrollHeight;
  markMessagesAsRead();
}


// ==================== MARK AS READ ====================
async function markMessagesAsRead() {
  if (!currentUser || !selectedUser || !currentChatId) return;

  try {
    await supabase
      .from("messages")
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq("chat_id", currentChatId)
      .eq("receiver_id", currentUser.id)
      .eq("read", false);
  } catch (err) {
    console.error("Read update error:", err);
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
  if (message.deleted_for_everyone) return;

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

  try {
    const { data } = await supabase
      .from("messages")
      .select("deleted_for")
      .eq("id", id)
      .single();

    const arr = data?.deleted_for || [];
    if (!arr.includes(currentUser.id)) {
      await supabase
        .from("messages")
        .update({ deleted_for: [...arr, currentUser.id] })
        .eq("id", id);
    }
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

  try {
    await supabase
      .from("messages")
      .update({
        deleted_for_everyone: true,
        text: "",
        deleted_at: new Date().toISOString()
      })
      .eq("id", id);
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

  const id = chatId(currentUser.id, selectedUser.uid);

  try {
    const { error } = await supabase.from("messages").insert({
      chat_id: id,
      sender_id: currentUser.id,
      receiver_id: selectedUser.uid,
      text: text,
      read: false,
      deleted_for: [],
      deleted_for_everyone: false
    });

    if (error) throw error;

    messageInput.value = "";

    // Realtime delay avoid karne ke liye ek refresh
    setTimeout(refreshMessages, 150);

  } catch (err) {
    console.error("Send error:", err);
    showToast("❌ Message send nahi hua");
  }
}


// ==================== LOGOUT ====================
logoutButton.addEventListener("click", async () => {
  if (currentUser) {
    try {
      await supabase
        .from("users")
        .update({
          online: false,
          last_seen: new Date().toISOString()
        })
        .eq("uid", currentUser.id);
    } catch (e) {}
  }

  stopPresence();
  await supabase.auth.signOut();
});


// ==================== BACK ====================
backButton.addEventListener("click", () => {
  selectedUser = null;
  currentChatId = null;

  appScreen.classList.remove("chat-open");

  chatBox.classList.add("hidden");
  emptyChat.classList.remove("hidden");

  if (stopMessages) { stopMessages(); stopMessages = null; }
  if (stopSelectedUser) { stopSelectedUser(); stopSelectedUser = null; }

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
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
postStatusBtn.addEventListener("click", postStatus);

myStatusCard.addEventListener("click", () => openAddStatusModal());
closeAddStatus.addEventListener("click", closeAddStatusModal);

document.querySelectorAll(".bg-color-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".bg-color-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedBgColor = btn.dataset.bg;
  });
});

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

function closeAddStatusModal() {
  addStatusModal.classList.add("hidden");
  pendingStatusImage = null;
}


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

    if (pendingStatusImage) {
      const path = `${currentUser.id}/${Date.now()}_${pendingStatusImage.name}`;

      const { error: upErr } = await supabase
        .storage
        .from("status")
        .upload(path, pendingStatusImage, { upsert: false });

      if (upErr) throw upErr;

      const { data: urlData } = supabase
        .storage
        .from("status")
        .getPublicUrl(path);

      imageUrl = urlData.publicUrl;
      type = "image";
    }

    const now = Date.now();

    const { error } = await supabase.from("status").insert({
      user_id: currentUser.id,
      user_name: currentUserData?.name || "User",
      user_email: currentUserData?.email || "",
      text: text,
      image_url: imageUrl,
      type: type,
      bg_color: selectedBgColor,
      expires_at: now + (24 * 60 * 60 * 1000),
      viewers: [],
      likes: []
    });

    if (error) throw error;

    showToast("✅ Status posted!");
    closeAddStatusModal();

  } catch (err) {
    console.error("Post status error:", err);
    showToast("❌ Status post nahi hua: " + (err.message || ""));
  }

  postStatusBtn.disabled = false;
  postStatusBtn.textContent = "Post Status";
}


// ==================== LOAD STATUSES ====================
async function loadStatuses() {
  if (stopStatuses) { stopStatuses(); stopStatuses = null; }

  await refreshStatuses();

  const channel = supabase
    .channel("status-rt-" + Date.now())
    .on("postgres_changes",
      { event: "*", schema: "public", table: "status" },
      () => refreshStatuses()
    )
    .subscribe();

  stopStatuses = () => supabase.removeChannel(channel);
}


async function refreshStatuses() {
  if (!currentUser) return;

  const now = Date.now();

  const { data, error } = await supabase
    .from("status")
    .select("*")
    .gt("expires_at", now)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Status load error:", error);
    statusList.innerHTML = `<p class="loading">Status load nahi ho raha.</p>`;
    return;
  }

  allStatuses = data || [];
  showStatuses();
}


// ==================== SHOW STATUSES ====================
function showStatuses() {
  statusList.innerHTML = "";

  const grouped = {};

  allStatuses.forEach((s) => {
    if (!grouped[s.user_id]) grouped[s.user_id] = [];
    grouped[s.user_id].push(s);
  });

  const otherUsersStatus = Object.keys(grouped).filter(
    (uid) => uid !== currentUser.id
  );

  const myStatuses = grouped[currentUser.id] || [];

  if (myStatuses.length > 0) {
    myStatusSub.textContent =
      `${myStatuses.length} update${myStatuses.length > 1 ? "s" : ""} · Tap to view`;
  } else {
    myStatusSub.textContent = "Tap to add status update";
  }

  if (otherUsersStatus.length === 0) {
    statusList.innerHTML = `<p class="loading">Abhi koi status nahi hai</p>`;
    return;
  }

  otherUsersStatus.sort((a, b) => {
    const aLatest = new Date(grouped[a][0].created_at).getTime() || 0;
    const bLatest = new Date(grouped[b][0].created_at).getTime() || 0;
    return bLatest - aLatest;
  });

  otherUsersStatus.forEach((uid) => {
    const userStatuses = grouped[uid];
    const latest = userStatuses[0];

    const hasViewed = userStatuses.every((s) =>
      (s.viewers || []).includes(currentUser.id)
    );

    const div = document.createElement("div");
    div.className = "status-item";

    const timeText = latest.created_at
      ? timeAgo(new Date(latest.created_at))
      : "";

    div.innerHTML = `
      <div class="status-ring ${hasViewed ? "viewed" : ""}">
        <div class="status-ring-inner">
          ${initials(latest.user_name)}
        </div>
      </div>
      <div class="status-info">
        <strong>${safe(latest.user_name || "User")}</strong>
        <small>${timeText}</small>
      </div>
      ${userStatuses.length > 1 ? `<div class="status-badge">${userStatuses.length}</div>` : ""}
    `;

    div.addEventListener("click", () => openStatusViewer(userStatuses, 0));
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

  const isMine = status.user_id === currentUser.id;

  viewerName.textContent = status.user_name || "User";
  viewerAvatar.textContent = initials(status.user_name);

  if (status.created_at) {
    viewerTime.textContent = timeAgo(new Date(status.created_at));
  }

  statusContent.innerHTML = "";

  if (status.type === "image" && status.image_url) {
    const img = document.createElement("img");
    img.src = status.image_url;
    img.alt = "status";
    statusContent.appendChild(img);
  } else {
    const div = document.createElement("div");
    div.className = "status-text";
    div.style.background = status.bg_color || "#2563eb";
    div.textContent = status.text || "";
    statusContent.appendChild(div);
  }

  if (isMine) {
    statusOwnerBar.classList.remove("hidden");
    statusViewerBar.classList.add("hidden");
    viewerCount.textContent = (status.viewers || []).length;
    likeCount.textContent = (status.likes || []).length;
  } else {
    statusOwnerBar.classList.add("hidden");
    statusViewerBar.classList.remove("hidden");

    const isLiked = (status.likes || []).includes(currentUser.id);
    if (isLiked) {
      likeStatusBtn.classList.add("liked");
      likeStatusBtn.textContent = "❤️ Liked";
    } else {
      likeStatusBtn.classList.remove("liked");
      likeStatusBtn.textContent = "❤️ Like";
    }

    markStatusViewed(status.id);
  }

  statusViewer.classList.remove("hidden");

  const bar = document.getElementById("statusProgress");
  bar.style.animation = "none";
  void bar.offsetWidth;
  bar.style.animation = "";

  if (statusTimeout) clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => nextStatus(), 5000);
}


function closeStatusViewer() {
  if (statusTimeout) {
    clearTimeout(statusTimeout);
    statusTimeout = null;
  }
  statusViewer.classList.add("hidden");
  currentViewingStatus = null;
}


function nextStatus() {
  if (!currentViewingStatus) return;
  const { statuses, index } = currentViewingStatus;
  if (index + 1 < statuses.length) {
    openStatusViewer(statuses, index + 1);
  } else {
    closeStatusViewer();
  }
}


closeViewer.addEventListener("click", closeStatusViewer);

statusContent.addEventListener("click", () => {
  nextStatus();
});


// ==================== MARK STATUS VIEWED ====================
async function markStatusViewed(statusId) {
  try {
    const { data } = await supabase
      .from("status")
      .select("viewers")
      .eq("id", statusId)
      .single();

    const viewers = data?.viewers || [];
    if (viewers.includes(currentUser.id)) return;

    await supabase
      .from("status")
      .update({ viewers: [...viewers, currentUser.id] })
      .eq("id", statusId);

  } catch (err) {
    console.error("Mark viewed error:", err);
  }
}


// ==================== LIKE STATUS ====================
likeStatusBtn.addEventListener("click", async () => {
  if (!currentViewingStatus) return;

  const { statuses, index } = currentViewingStatus;
  const status = statuses[index];

  if (status.user_id === currentUser.id) return;

  try {
    const { data } = await supabase
      .from("status")
      .select("likes")
      .eq("id", status.id)
      .single();

    const likes = data?.likes || [];
    const isLiked = likes.includes(currentUser.id);

    const newLikes = isLiked
      ? likes.filter((x) => x !== currentUser.id)
      : [...likes, currentUser.id];

    await supabase
      .from("status")
      .update({ likes: newLikes })
      .eq("id", status.id);

    // Update local state so UI reflects instantly
    status.likes = newLikes;

    if (isLiked) {
      likeStatusBtn.classList.remove("liked");
      likeStatusBtn.textContent = "❤️ Like";
      showToast("💔 Like removed");
    } else {
      likeStatusBtn.classList.add("liked");
      likeStatusBtn.textContent = "❤️ Liked";
      showToast("❤️ Liked!");
    }

  } catch (err) {
    console.error("Like error:", err);
  }
});


// ==================== VIEWERS / LIKES MODAL ====================
ownerViewersBtn.addEventListener("click", () => showViewersModal("viewers"));
ownerLikesBtn.addEventListener("click", () => showViewersModal("likes"));

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

  viewersList.innerHTML = `<p class="loading">Loading...</p>`;
  viewersModal.classList.remove("hidden");

  if (uids.length === 0) {
    viewersList.innerHTML =
      `<p class="loading">Abhi koi ${type === "viewers" ? "viewer" : "like"} nahi hai</p>`;
    return;
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .in("uid", uids);

    if (error) throw error;

    viewersList.innerHTML = "";

    (data || []).forEach((user) => {
      const div = document.createElement("div");
      div.className = "viewer-item";
      div.innerHTML = `
        <div class="avatar">${initials(user.name)}</div>
        <div class="viewer-item-info">
          <strong>${safe(user.name || "User")}</strong>
          <small>${safe(user.email || "")}</small>
        </div>
      `;
      viewersList.appendChild(div);
    });

  } catch (err) {
    console.error("Load viewer error:", err);
    viewersList.innerHTML = `<p class="loading">Load nahi ho paya.</p>`;
  }
}


// ==================== OWNER DELETE STATUS ====================
ownerDeleteBtn.addEventListener("click", async () => {
  if (!currentViewingStatus) return;

  const { statuses, index } = currentViewingStatus;
  const status = statuses[index];

  if (status.user_id !== currentUser.id) {
    showToast("❌ Ye aapka status nahi hai");
    return;
  }

  if (!confirm("Ye status delete karna hai?")) return;

  try {
    await supabase.from("status").delete().eq("id", status.id);
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
