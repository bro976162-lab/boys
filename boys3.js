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
  updateDoc,
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
