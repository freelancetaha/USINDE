// 1. Initialize Clerk
Clerk.load({
    frontendApi: 'https://joint-bass-70.clerk.accounts.dev'  // get this from your Clerk dashboard
  }).then(() => {
    const { clerk } = window;
    
    // Mount Clerk’s Sign In widget
    clerk.mountSignIn('#clerk-sign-in', {
      afterSignInUrl: window.location.href,
      afterSignUpUrl: window.location.href,
    });
  
    // Listen for changes in auth state
    clerk.addListener((user) => {
      if (clerk.user) {
        // User is signed in! Show protected content.
        document.getElementById('clerk-sign-in').style.display = 'none';
        document.getElementById('protected-content').style.display = 'block';
        document.getElementById('user-name').textContent = clerk.user.fullName || clerk.user.primaryEmailAddress;
  
        // Initialize Firebase now that we know the user is authenticated
        initFirebase();
      } else {
        // No user → hide protected content, show sign-in form
        document.getElementById('protected-content').style.display = 'none';
        document.getElementById('clerk-sign-in').style.display = 'block';
      }
    });
  
    // Sign-out button
    document.getElementById('sign-out').addEventListener('click', () => {
      clerk.signOut();
    });
  });
  
  // 2. Firebase initialization & usage
  function initFirebase() {
    // Prevent re‑initializing
    if (window.firebaseInitialized) return;
    window.firebaseInitialized = true;
  
    // Your Firebase config (from Firebase console)
    const firebaseConfig = {
      apiKey: 'AIzaSyA1kGDOAuQRqdgXHX3Ugjj_zL7_bqYXos0',
      authDomain: 'myapp-3a874.firebaseapp.com',
      projectId: 'myapp-3a874',
      storageBucket: 'myapp-3a874.appspot.com',
      messagingSenderId: '430236087961',
      appId: '1:430236087961:web:d7b0e75c6cf2498c9b6a08'
    };
  
    // Load Firebase scripts dynamically
    const s1 = document.createElement('script');
    s1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
      s2.onload = () => {
        // Initialize
        const app = firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
  
        // Example: write a doc under the user’s UID
        const uid = window.clerk.user.id;
        db.collection('users').doc(uid).set({
          lastLogin: firebase.firestore.Timestamp.now(),
          name: window.clerk.user.fullName
        })
        .then(() => console.log('User record updated'))
        .catch(console.error);
      };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  }
  