// Firebase Configuration
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyA1kGDOAuQRqdgXHX3Ugjj_zL7_bqYXos0",
    authDomain: "myapp-3a874.firebaseapp.com",
    databaseURL: "https://myapp-3a874-default-rtdb.firebaseio.com",
    projectId: "myapp-3a874",
    storageBucket: "myapp-3a874.appspot.com",
    messagingSenderId: "430236087961",
    appId: "1:430236087961:web:d7b0e75c6cf2498c9b6a08",
    measurementId: "G-JCKBGD4LQ3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebase.auth();

// Initialize Firestore
const db = firebase.firestore(); 