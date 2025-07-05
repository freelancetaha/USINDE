const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  navToggle.classList.toggle('open');
});

// Dynamic News Page Loader
if (window.location.pathname.includes('news.html')) {
  console.log('Running JS for news.html');

  // ————————————————————————————————
  // 1) Inject Complete & Improved CSS
  // ————————————————————————————————
  const style = document.createElement('style');
  style.textContent = `
    /* Reset & base */
    *, *::before, *::after { box-sizing: border-box; }
      body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
    }

    #news-container{
      margin-top: 100px;
    }

    /* ✅ Fix header overlap by adding top padding to main content */
    main {
      max-width: 900px;
      padding: 0 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 40px;
      font-size: 2rem;
      color: #222;
    }

    .news-card {
      background: #fff;
      border-radius: 12px;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 20px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      transition: transform 0.3s ease;
    }

    .news-card:hover {
      transform: translateY(-4px);
    }

    .news-image {
      width: 160px;
      height: 160px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .news-content {
      flex: 1;
    }

    .news-content h2 {
      margin: 0;
      font-size: 1.4rem;
      color: #111;
    }

    .news-date {
      display: block;
      font-size: 0.875rem;
      color: #888;
      margin: 6px 0 10px;
    }

    .news-content p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.6;
      color: #444;
    }

    /* "Read Original" source link */
    .news-source {
      margin-top: auto;
      font-size: 0.9rem;
      color: #007bff;
      text-decoration: none;
      transition: color 0.2s;
    }
    .news-source:hover {
      color: #0056b3;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .news-card {
        flex-direction: column;
        text-align: center;
      }
      .news-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .news-content h2 { font-size: 1.2rem; }
      .news-content p { font-size: 0.95rem; }
      .news-source { align-self: center; }
    }
  `;
  document.head.appendChild(style);

  // ————————————————————————————————
  // 2) Fetch & Render the News Items
  // ————————————————————————————————
  const container = document.getElementById('news-container');
  const renderNews = (items) => {
    if (!container) return;
    container.innerHTML = items.map(item => `
      <a href="${item.link || '#'}" class="news-link" target="_blank">
        <div class="news-card">
          <img src="${item.image}" alt="${item.title}" class="news-image" />
          <div class="news-content">
            <h2>${item.title}</h2>
            <span class="news-date">
              ${new Date(item.date).toLocaleDateString()}
            </span>
            <p>${item.content}</p>
            ${item.source ? `<a href="${item.source}" class="news-source" target="_blank" rel="noopener noreferrer">Read Original Source</a>` : ''}
          </div>
        </div>
      </a>
    `).join('');
  };

  const getStoredNews = () => {
    try {
      return JSON.parse(localStorage.getItem('userNews') || '[]');
    } catch {
      return [];
    }
  };

  const saveStoredNews = (items) => {
    localStorage.setItem('userNews', JSON.stringify(items));
  };

  // Fetch initial news from news.json
  fetch('news.json')
    .then(res => res.json())
    .then(newsItems => {
      const allNews = [...getStoredNews(), ...newsItems];
      renderNews(allNews);
    })
    .catch(err => {
      console.error('Failed to load news:', err);
      renderNews(getStoredNews()); // fallback to user news only
    });
 }

// Dynamic Sindh University Tests Data
let testsData = [
  {
    title: "General Knowledge Mock Test",
    questions: []
  },
  {
    title: "English Proficiency Test",
    questions: []
  },
  {
    title: "Mathematics Practice Exam",
    questions: []
  },
  {
    title: "Custom Subject Test",
    questions: []
  }
];

// Load tests data from Firestore
async function loadTestsFromFirestore() {
  try {
    if (!db) {
      console.warn('Firestore not available, using local data');
      renderTestsList();
      if (isAdmin) {
        renderAdminTests();
        renderAdminTestSelect();
      }
      return;
    }
    console.log('Loading tests from Firestore...');
    const testsSnapshot = await db.collection('tests').get();
    console.log('Firestore response:', testsSnapshot);
    if (!testsSnapshot.empty) {
      console.log('Found existing tests in database');
      testsData = [];
      const seenTitles = new Set();
      testsSnapshot.forEach(doc => {
        const testData = doc.data();
        if (!seenTitles.has(testData.title)) {
          seenTitles.add(testData.title);
          testsData.push({
            id: doc.id,
            title: testData.title,
            questions: testData.questions || []
          });
        }
      });
    } else {
      console.log('No tests found in database, creating defaults...');
      await createDefaultTests();
    }
    renderTestsList();
    if (isAdmin) {
      renderAdminTests();
      renderAdminTestSelect();
    }
  } catch (error) {
    console.error('Error loading tests from Firestore:', error);
    console.log('Error details:', error.code, error.message);
    // Fallback to local data if Firestore fails
    testsData = [
      {
        title: "General Knowledge Mock Test",
        questions: []
      },
      {
        title: "English Proficiency Test",
        questions: []
      },
      {
        title: "Mathematics Practice Exam",
        questions: []
      },
      {
        title: "Custom Subject Test",
        questions: []
      }
    ];
    renderTestsList();
    if (isAdmin) {
      renderAdminTests();
      renderAdminTestSelect();
    }
  }
}

// Create default tests in Firestore
async function createDefaultTests() {
  try {
    if (!db) {
      console.warn('Firestore not available, skipping default test creation');
      return;
    }

    console.log('Creating default tests in Firestore...');
    const defaultTests = [
      {
        title: "General Knowledge Mock Test",
        questions: []
      },
      {
        title: "English Proficiency Test",
        questions: []
      },
      {
        title: "Mathematics Practice Exam",
        questions: []
      },
      {
        title: "Custom Subject Test",
        questions: []
      }
    ];

    for (const test of defaultTests) {
      const docRef = await db.collection('tests').add(test);
      console.log('Created test with ID:', docRef.id);
    }
    
    console.log('Default tests created successfully');
    // Reload tests after creating defaults
    await loadTestsFromFirestore();
  } catch (error) {
    console.error('Error creating default tests:', error);
    console.log('Error details:', error.code, error.message);
    // Don't throw error, just log it
  }
}

// Save test to Firestore
async function saveTestToFirestore(testIndex, testData) {
  try {
    if (!db) {
      console.warn('Firestore not available, saving to local data only');
      return;
    }

    console.log('Saving test to Firestore:', testData);
    
    if (testsData[testIndex].id) {
      // Update existing test
      console.log('Updating existing test with ID:', testsData[testIndex].id);
      await db.collection('tests').doc(testsData[testIndex].id).update({
        title: testData.title,
        questions: testData.questions
      });
      console.log('Test updated successfully');
    } else {
      // Create new test
      console.log('Creating new test');
      const docRef = await db.collection('tests').add(testData);
      testsData[testIndex].id = docRef.id;
      console.log('New test created with ID:', docRef.id);
    }
  } catch (error) {
    console.error('Error saving test to Firestore:', error);
    console.log('Error details:', error.code, error.message);
    // Don't throw error, just log it and continue with local data
  }
}

// Delete question from Firestore
async function deleteQuestionFromFirestore(testIndex, questionIndex) {
  try {
    const test = testsData[testIndex];
    test.questions.splice(questionIndex, 1);
    
    if (db && test.id) {
      await db.collection('tests').doc(test.id).update({
        questions: test.questions
      });
    }
    
    renderAdminTests();
    renderTestsList();
  } catch (error) {
    console.error('Error deleting question from Firestore:', error);
    // Still update local data even if Firestore fails
    renderAdminTests();
    renderTestsList();
    alert('Question deleted locally. Firestore update failed.');
  }
}

// Test Modal Logic for tests.html
if (document.getElementById('test-modal')) {
  const testModal = document.getElementById('test-modal');
  const closeModalBtn = document.getElementById('close-test-modal');
  const quizForm = document.getElementById('quiz-form');
  const quizResult = document.getElementById('quiz-result');
  const testLinks = document.querySelectorAll('.tests-list a');
  const testTitle = document.getElementById('test-title');

  // Helper to check login
  function isUserLoggedIn() {
    // This variable is set in the user auth logic
    return typeof user !== 'undefined' && user !== null;
  }

  // Open modal on test click
  testLinks.forEach((link, idx) => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      if (!isUserLoggedIn()) {
        alert('You must be logged in to take a test.');
        return;
      }
      currentTest = testsData[idx];
      testTitle.textContent = currentTest.title;
      renderQuiz(currentTest);
      testModal.classList.add('show');
      quizResult.style.display = 'none';
    });
  });

  // Protect the "Start Your First Test" button
  const startTestBtn = document.querySelector('.cta-tests .btn');
  if (startTestBtn) {
    startTestBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!isUserLoggedIn()) {
        alert('You must be logged in to start a test.');
        return;
      }
      // Optionally, open the first test modal or scroll to test list
      const firstTestLink = document.querySelector('#tests-list-ul a');
      if (firstTestLink) firstTestLink.click();
    });
  }

  // Render quiz dynamically
  function renderQuiz(test) {
    quizForm.innerHTML = '';
    test.questions.forEach((qObj, i) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'quiz-question';
      const qP = document.createElement('p');
      qP.textContent = `${i + 1}. ${qObj.q}`;
      qDiv.appendChild(qP);
      qObj.options.forEach((opt, j) => {
        const label = document.createElement('label');
        label.style.display = 'block';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q${i}`;
        radio.value = j;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + opt));
        qDiv.appendChild(label);
      });
      quizForm.appendChild(qDiv);
    });
    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn';
    submitBtn.textContent = 'Submit Answers';
    quizForm.appendChild(submitBtn);
    quizForm.style.display = '';

    // Attach submit handler every time quiz is rendered
    quizForm.onsubmit = async function(e) {
      e.preventDefault();
      let score = 0;
      if (!currentTest) return;
      currentTest.questions.forEach((qObj, i) => {
        const selected = quizForm[`q${i}`].value;
        if (parseInt(selected) === qObj.answer) score++;
      });
      quizResult.textContent = `You scored ${score} out of ${currentTest.questions.length}!`;
      quizResult.style.display = 'block';
      quizForm.style.display = 'none';

      // Save result to Firestore with user name, email, and user ID for better linking
      if (typeof db !== 'undefined' && db && user) {
        try {
          console.log('Submitting test:', { currentTest });
          await db.collection('testResults').add({
            testTitle: currentTest.title,
            userName: user.displayName || '',
            userEmail: user.email || '',
            userId: user.uid || '',
            score: score,
            total: currentTest.questions.length,
            timestamp: new Date()
          });
          // Also save to the test's submissions subcollection using test ID
          if (currentTest.id) {
            // Get user phone from users collection
            let phone = '';
            try {
              const userDoc = await db.collection('users').doc(user.uid).get();
              if (userDoc.exists) {
                phone = userDoc.data().phone || '';
              }
            } catch {}
            await db.collection('tests').doc(currentTest.id).collection('submissions').add({
              userName: user.displayName || '',
              userEmail: user.email || '',
              userId: user.uid || '',
              phone: phone,
              score: score,
              total: currentTest.questions.length,
              timestamp: new Date()
            });
            console.log('Submission saved to subcollection for test ID:', currentTest.id);
          } else {
            alert('Error: Test ID not found for submission. Submission not saved to subcollection. Please contact admin.');
            console.error('Test ID missing for submission. currentTest:', currentTest);
          }
        } catch (err) {
          console.error('Failed to save test result:', err);
          alert('Failed to save your test result. Please check your internet connection or contact support.');
        }
      } else {
        alert('Test result not saved: Firestore is not available or you are not logged in.');
        console.warn('Test result not saved: Firestore is not available or user is not logged in.');
      }
    };
  }

  // Close modal
  closeModalBtn.addEventListener('click', function() {
    testModal.classList.remove('show');
  });
  window.addEventListener('click', function(e) {
    if (e.target === testModal) {
      testModal.classList.remove('show');
    }
  });
}

// Dynamic Tests List Rendering
function renderTestsList() {
  const testsListUl = document.getElementById('tests-list-ul');
  if (!testsListUl) return;
  testsListUl.innerHTML = '';
  testsData.forEach((test, idx) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = test.title;
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const testModal = document.getElementById('test-modal');
      const testTitle = document.getElementById('test-title');
      const quizForm = document.getElementById('quiz-form');
      const quizResult = document.getElementById('quiz-result');
      if (testModal && testTitle && quizForm && quizResult) {
        currentTest = { ...testsData[idx] }; // clone to avoid mutation
        testTitle.textContent = currentTest.title;
        renderQuiz(currentTest);
        testModal.classList.add('show');
        quizResult.style.display = 'none';
      }
    });
    li.appendChild(a);
    testsListUl.appendChild(li);
  });
}

// Admin Panel Functionality with Firebase Authentication
let isAdmin = false;
let currentUser = null;

const adminLoginBtn = document.getElementById('admin-login-btn');
const adminPanel = document.getElementById('admin-panel');
const adminTestsList = document.getElementById('admin-tests-list');
const adminAddQuestionForm = document.getElementById('admin-add-question-form');
const adminTestSelect = document.getElementById('admin-test-select');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const loginRequired = document.getElementById('login-required');
const loginPromptBtn = document.getElementById('login-prompt-btn');
const signupPromptBtn = document.getElementById('signup-prompt-btn');
const adminSignupSection = document.getElementById('admin-signup-section');
const adminSignupForm = document.getElementById('admin-signup-form');
const cancelSignupBtn = document.getElementById('cancel-signup');
const adminSetTimingForm = document.getElementById('admin-set-timing-form');
const adminTimingTestSelect = document.getElementById('admin-timing-test-select');
const adminStartTime = document.getElementById('admin-start-time');
const adminEndTime = document.getElementById('admin-end-time');

// Firebase Authentication Functions
function promptAdminLogin() {
  const email = prompt('Enter admin email:');
  if (email) {
    const password = prompt('Enter admin password:');
    if (password) {
      signInWithEmailAndPassword(email, password);
    }
  }
}

function signInWithEmailAndPassword(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      isAdmin = true;
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminEmail', email);
      showAdminPanel();
      updateAdminUI();
      alert('Admin login successful!');
    })
    .catch((error) => {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. ';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage += 'User not found. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage += 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Invalid email format.';
          break;
        case 'auth/invalid-credential':
          errorMessage += 'Invalid credentials. Please check your email and password.';
          break;
        case 'auth/too-many-requests':
          errorMessage += 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage += error.message;
      }
      alert(errorMessage);
    });
}

function createAdminAccount(email, password) {
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      isAdmin = true;
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminEmail', email);
      hideSignupSection();
      showAdminPanel();
      updateAdminUI();
      alert('Admin account created successfully! You are now logged in.');
    })
    .catch((error) => {
      console.error('Signup error:', error);
      let errorMessage = 'Account creation failed. ';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage += 'Email already exists. Please login instead.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Invalid email format.';
          break;
        case 'auth/weak-password':
          errorMessage += 'Password is too weak. Use at least 6 characters.';
          break;
        default:
          errorMessage += error.message;
      }
      alert(errorMessage);
    });
}

function signOutAdmin() {
  auth.signOut()
    .then(() => {
      currentUser = null;
      isAdmin = false;
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminEmail');
      hideAdminPanel();
      updateAdminUI();
      alert('Admin logged out successfully!');
    })
    .catch((error) => {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
    });
}

// Check authentication state on page load
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    isAdmin = true;
    showAdminPanel();
    updateAdminUI();
  } else {
    currentUser = null;
    isAdmin = false;
    hideAdminPanel();
    updateAdminUI();
  }
  
  // Load tests data after authentication check
  loadTestsFromFirestore();
});

// Admin Login Logic
if (adminLoginBtn) {
  adminLoginBtn.addEventListener('click', function() {
    promptAdminLogin();
  });
}

// Login Prompt Button Logic
if (loginPromptBtn) {
  loginPromptBtn.addEventListener('click', function() {
    promptAdminLogin();
  });
}

// Signup Prompt Button Logic
if (signupPromptBtn) {
  signupPromptBtn.addEventListener('click', function() {
    showSignupSection();
  });
}

// Cancel Signup Button Logic
if (cancelSignupBtn) {
  cancelSignupBtn.addEventListener('click', function() {
    hideSignupSection();
  });
}

// Admin Signup Form Handler
if (adminSignupForm) {
  adminSignupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    
    createAdminAccount(email, password);
  });
}

// Admin Logout Logic
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener('click', function() {
    signOutAdmin();
  });
}

// Admin Refresh Results Logic
const refreshResultsBtn = document.getElementById('refresh-results-btn');
const exportResultsBtn = document.getElementById('export-results-btn');
const resultsSearch = document.getElementById('results-search');
const showUserStatsBtn = document.getElementById('show-user-stats-btn');
const userStatsSection = document.getElementById('user-stats-section');

if (refreshResultsBtn) {
  refreshResultsBtn.addEventListener('click', function() {
    renderAdminTestResults();
  });
}

if (exportResultsBtn) {
  exportResultsBtn.addEventListener('click', function() {
    exportResultsToCSV();
  });
}

if (resultsSearch) {
  resultsSearch.addEventListener('input', function() {
    filterResults(this.value);
  });
}

if (showUserStatsBtn) {
  showUserStatsBtn.addEventListener('click', function() {
    toggleUserStats();
  });
}

function showAdminPanel() {
  if (adminPanel) {
    adminPanel.style.display = 'block';
    renderAdminTests();
    renderAdminTestSelect();
    renderAdminTestResults();
    renderAdminUsers();
    renderSubmittedUsers();
  }
  if (loginRequired) {
    loginRequired.style.display = 'none';
  }
  if (adminSignupSection) {
    adminSignupSection.style.display = 'none';
  }
}

function hideAdminPanel() {
  if (adminPanel) {
    adminPanel.style.display = 'none';
  }
  if (loginRequired) {
    loginRequired.style.display = 'block';
  }
}

function showSignupSection() {
  if (adminSignupSection) {
    adminSignupSection.style.display = 'block';
  }
  if (loginRequired) {
    loginRequired.style.display = 'none';
  }
}

function hideSignupSection() {
  if (adminSignupSection) {
    adminSignupSection.style.display = 'none';
  }
  if (loginRequired) {
    loginRequired.style.display = 'block';
  }
}

function updateAdminUI() {
  if (isAdmin && currentUser) {
    if (adminLoginBtn) adminLoginBtn.style.display = 'none';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'inline-block';
  } else {
    if (adminLoginBtn) adminLoginBtn.style.display = 'inline-block';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';
  }
}

function renderAdminTests() {
  if (!adminTestsList) return;
  
  adminTestsList.innerHTML = '';
  testsData.forEach((test, tIdx) => {
    const testDiv = document.createElement('div');
    testDiv.style.marginBottom = '20px';
    testDiv.style.padding = '15px';
    testDiv.style.border = '1px solid #ddd';
    testDiv.style.borderRadius = '8px';
    testDiv.style.backgroundColor = '#f9f9f9';
    
    testDiv.innerHTML = `<h4 style="margin:0 0 10px 0; color:#1838eb;">${test.title}</h4>`;
    
    if (test.questions.length === 0) {
      testDiv.innerHTML += '<p style="color:#666; font-style:italic;">No questions added yet.</p>';
    } else {
      test.questions.forEach((qObj, qIdx) => {
        const qBlock = document.createElement('div');
        qBlock.style.marginBottom = '10px';
        qBlock.style.padding = '10px';
        qBlock.style.backgroundColor = '#fff';
        qBlock.style.borderRadius = '5px';
        qBlock.style.border = '1px solid #eee';
        
        qBlock.innerHTML = `
          <strong>Q:</strong> ${qObj.q}<br>
          <strong>Options:</strong> ${qObj.options.map((o,i) => `${i+1}) ${o}`).join(' | ')}<br>
          <strong>Answer:</strong> ${qObj.options[qObj.answer]}
          <button class='admin-remove-btn' data-tidx='${tIdx}' data-qidx='${qIdx}' style="background:#f73838; color:#fff; border:none; border-radius:5px; padding:5px 10px; margin-left:10px; cursor:pointer;">Remove</button>
        `;
        testDiv.appendChild(qBlock);
      });
    }
    
    adminTestsList.appendChild(testDiv);
  });
  
  // Remove question handler
  adminTestsList.querySelectorAll('.admin-remove-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tIdx = parseInt(this.getAttribute('data-tidx'));
      const qIdx = parseInt(this.getAttribute('data-qidx'));
      deleteQuestionFromFirestore(tIdx, qIdx);
    });
  });
}

function renderAdminTestSelect() {
  if (!adminTestSelect) return;
  
  adminTestSelect.innerHTML = '';
  testsData.forEach((test, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = test.title;
    adminTestSelect.appendChild(opt);
  });
}

// Admin Add Question Form Handler
if (adminAddQuestionForm) {
  adminAddQuestionForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const tIdx = parseInt(adminTestSelect.value);
    const question = document.getElementById('admin-question').value.trim();
    const opt1 = document.getElementById('admin-opt1').value.trim();
    const opt2 = document.getElementById('admin-opt2').value.trim();
    const opt3 = document.getElementById('admin-opt3').value.trim();
    const correct = parseInt(document.getElementById('admin-correct').value);
    
    if (question && opt1 && opt2 && opt3) {
      try {
        // Add question to local data
        testsData[tIdx].questions.push({
          q: question,
          options: [opt1, opt2, opt3],
          answer: correct
        });
        
        // Save to Firestore (if available)
        await saveTestToFirestore(tIdx, testsData[tIdx]);
        
        renderAdminTests();
        renderTestsList();
        adminAddQuestionForm.reset();
        
        // Check if Firestore is available for success message
        if (db) {
          alert('Question added successfully and saved to database!');
        } else {
          alert('Question added successfully (saved locally only). Please enable Firestore for cloud storage.');
        }
      } catch (error) {
        console.error('Error adding question:', error);
        // Still update local data even if Firestore fails
        renderAdminTests();
        renderTestsList();
        adminAddQuestionForm.reset();
        alert('Question added locally. Database save failed. Please check Firestore setup.');
      }
    } else {
      alert('Please fill in all fields.');
    }
  });
}

// Initialize tests list if on tests page
if (document.getElementById('tests-list-ul')) {
  // Load tests from Firestore when on tests page
  loadTestsFromFirestore();
}

// Debug functionality for admin page
if (window.location.pathname.includes('admin.html')) {
  // Add debug button to login required section
  const loginRequired = document.getElementById('login-required');
  if (loginRequired) {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'Debug Firebase';
    debugBtn.className = 'btn';
    debugBtn.style.background = '#6c757d';
    debugBtn.style.marginTop = '10px';
    debugBtn.addEventListener('click', showDebugSection);
    loginRequired.appendChild(debugBtn);
  }
  
  // Debug section elements
  const debugSection = document.getElementById('debug-section');
  const debugInfo = document.getElementById('debug-info');
  const testFirestoreBtn = document.getElementById('test-firestore-btn');
  const createTestDataBtn = document.getElementById('create-test-data-btn');
  
  function showDebugSection() {
    if (debugSection) {
      debugSection.style.display = 'block';
      updateDebugInfo();
    }
  }
  
  function updateDebugInfo() {
    if (!debugInfo) return;
    
    const info = [];
    info.push('<strong>Firebase Status:</strong>');
    info.push(`- Firebase loaded: ${typeof firebase !== 'undefined' ? '✅ Yes' : '❌ No'}`);
    info.push(`- Firestore available: ${typeof db !== 'undefined' ? '✅ Yes' : '❌ No'}`);
    info.push(`- Auth available: ${typeof auth !== 'undefined' ? '✅ Yes' : '❌ No'}`);
    
    if (typeof firebase !== 'undefined') {
      info.push(`- Firebase version: ${firebase.SDK_VERSION || 'Unknown'}`);
    }
    
    if (typeof db !== 'undefined') {
      info.push(`- Firestore instance: ${db ? '✅ Created' : '❌ Failed'}`);
    }
    
    info.push('<br><strong>Current User:</strong>');
    if (currentUser) {
      info.push(`- Logged in: ✅ ${currentUser.email}`);
      info.push(`- UID: ${currentUser.uid}`);
    } else {
      info.push('- Logged in: ❌ No user');
    }
    
    info.push('<br><strong>Local Data:</strong>');
    info.push(`- Tests count: ${testsData.length}`);
    info.push(`- Total questions: ${testsData.reduce((sum, test) => sum + test.questions.length, 0)}`);
    
    debugInfo.innerHTML = info.join('<br>');
  }
  
  if (testFirestoreBtn) {
    testFirestoreBtn.addEventListener('click', async function() {
      try {
        if (!db) {
          alert('Firestore not available. Please check Firebase setup.');
          return;
        }
        
        // Test basic Firestore operation
        const testDoc = await db.collection('test').doc('connection-test').get();
        alert('Firestore connection successful! ✅');
        updateDebugInfo();
      } catch (error) {
        console.error('Firestore test failed:', error);
        alert(`Firestore test failed: ${error.message}\n\nPlease check:\n1. Firestore is enabled in Firebase Console\n2. Security rules allow read/write\n3. Project ID is correct`);
      }
    });
  }
  
  if (createTestDataBtn) {
    createTestDataBtn.addEventListener('click', async function() {
      try {
        if (!db) {
          alert('Firestore not available. Please check Firebase setup.');
          return;
        }
        
        // Create a test document
        await db.collection('test').doc('sample').set({
          message: 'Test data created successfully',
          timestamp: new Date(),
          test: true
        });
        
        alert('Test data created successfully! ✅\nCheck Firebase Console → Firestore Database');
        updateDebugInfo();
      } catch (error) {
        console.error('Test data creation failed:', error);
        alert(`Test data creation failed: ${error.message}\n\nPlease check Firestore security rules.`);
      }
    });
  }
}

// User Auth Logic for tests.html
document.addEventListener('DOMContentLoaded', function() {
  // Only run this logic if the login form exists (i.e., on tests.html)
  if (!document.getElementById('user-login-form')) return;
  // Elements
  const userAuthSection = document.getElementById('user-auth-section');
  const userAuthForms = document.getElementById('user-auth-forms');
  const userLoginForm = document.getElementById('user-login-form');
  const userSignupForm = document.getElementById('user-signup-form');
  const showSignupLink = document.getElementById('show-signup-link');
  const showLoginLink = document.getElementById('show-login-link');
  const userInfo = document.getElementById('user-info');
  const userEmailSpan = document.getElementById('user-email');
  const userLogoutBtn = document.getElementById('user-logout-btn');
  const testsListSection = document.querySelector('.tests-list');

  let user = null;

  function showLogin() {
    userLoginForm.style.display = '';
    userSignupForm.style.display = 'none';
  }
  function showSignup() {
    userLoginForm.style.display = 'none';
    userSignupForm.style.display = '';
  }
  if (showSignupLink) showSignupLink.onclick = (e) => { e.preventDefault(); showSignup(); };
  if (showLoginLink) showLoginLink.onclick = (e) => { e.preventDefault(); showLogin(); };

  // Login
  if (userLoginForm) {
    userLoginForm.onsubmit = async function(e) {
      e.preventDefault();
      const email = document.getElementById('user-login-email').value.trim();
      const password = document.getElementById('user-login-password').value;
      try {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        user = cred.user;
        updateUserUI();
      } catch (err) {
        alert('Login failed: ' + err.message);
      }
    };
  }
  // Signup
  if (userSignupForm) {
    userSignupForm.onsubmit = async function(e) {
      e.preventDefault();
      const name = document.getElementById('user-signup-name').value.trim();
      const email = document.getElementById('user-signup-email').value.trim();
      const phone = document.getElementById('user-signup-phone').value.trim();
      const idFrontFile = document.getElementById('user-signup-id-front').files[0];
      const idBackFile = document.getElementById('user-signup-id-back').files[0];
      const password = document.getElementById('user-signup-password').value;
      const confirm = document.getElementById('user-signup-confirm').value;
      if (!name) {
        alert('Please enter your full name.');
        return;
      }
      if (!phone) {
        alert('Please enter your phone number.');
        return;
      }
      if (!idFrontFile || !idBackFile) {
        alert('Please upload both front and back images of your ID card.');
        return;
      }
      if (password !== confirm) {
        alert('Passwords do not match!');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
      }
      try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        user = cred.user;
        await user.updateProfile({ displayName: name });
        // Upload ID images to Firebase Storage
        const storageRef = firebase.storage().ref();
        const idFrontRef = storageRef.child(`user_ids/${user.uid}_front_${Date.now()}`);
        const idBackRef = storageRef.child(`user_ids/${user.uid}_back_${Date.now()}`);
        const idFrontSnap = await idFrontRef.put(idFrontFile);
        const idBackSnap = await idBackRef.put(idBackFile);
        const idFrontUrl = await idFrontSnap.ref.getDownloadURL();
        const idBackUrl = await idBackSnap.ref.getDownloadURL();
        // Save user info to Firestore
        await db.collection('users').doc(user.uid).set({
          name,
          email,
          phone,
          idFrontUrl,
          idBackUrl,
          createdAt: new Date()
        });
        updateUserUI();
      } catch (err) {
        alert('Signup failed: ' + err.message);
      }
    };
  }
  // Logout
  if (userLogoutBtn) {
    userLogoutBtn.onclick = async function() {
      await auth.signOut();
      user = null;
      updateUserUI();
    };
  }
  // Auth state
  auth.onAuthStateChanged(function(u) {
    user = u;
    updateUserUI();
  });
  function updateUserUI() {
    if (user) {
      userAuthForms.style.display = 'none';
      userInfo.style.display = '';
      userEmailSpan.textContent = user.email;
      if (testsListSection) testsListSection.style.display = '';
    } else {
      userAuthForms.style.display = '';
      userInfo.style.display = 'none';
      if (testsListSection) testsListSection.style.display = 'none';
      showLogin(); // Always show login by default
    }
  }
  // Hide test list until login
  if (testsListSection) testsListSection.style.display = 'none';
  showLogin(); // Show login by default
});

// Place this at the top level, before any function that uses currentTest
let currentTest = null;

// Add this after showAdminPanel() function or after admin panel logic
async function renderAdminTestResults() {
  const resultsDiv = document.getElementById('admin-test-results');
  if (!resultsDiv) return;
  resultsDiv.innerHTML = '<h3>User Test Results</h3><p>Loading...</p>';
  try {
    if (!db) {
      resultsDiv.innerHTML = '<h3>User Test Results</h3><p style="color:red;">Firestore is not available. Please check your Firebase setup.</p>';
      return;
    }
    // Fetch all test results
    const resultsSnap = await db.collection('testResults').orderBy('timestamp', 'desc').get();
    if (resultsSnap.empty) {
      resultsDiv.innerHTML = '<h3>User Test Results</h3><p>No test results found.</p>';
      allResultsData = [];
      return;
    }
    // Fetch all users for phone lookup
    const usersSnap = await db.collection('users').get();
    const usersMap = {};
    usersSnap.forEach(doc => {
      usersMap[doc.id] = doc.data();
    });
    
    // Process and store results data
    allResultsData = [];
    resultsSnap.forEach(doc => {
      const d = doc.data();
      let phone = '';
      let name = d.userName || '';
      
      // Try to find user by userId first (most reliable), then by email
      if (d.userId && usersMap[d.userId]) {
        phone = usersMap[d.userId].phone || '';
        name = usersMap[d.userId].name || d.userName || '';
      } else {
        // Fallback: try to find by email
        for (const uid in usersMap) {
          if (usersMap[uid].email === d.userEmail) {
            phone = usersMap[uid].phone || '';
            name = usersMap[uid].name || d.userName || '';
            break;
          }
        }
      }
      
      // Calculate percentage
      const percentage = d.total > 0 ? Math.round((d.score / d.total) * 100) : 0;
      const timestamp = d.timestamp && d.timestamp.toDate ? d.timestamp.toDate().toLocaleString() : 'N/A';
      
      allResultsData.push({
        name: name || 'N/A',
        phone: phone || 'N/A',
        testTitle: d.testTitle || 'N/A',
        score: d.score,
        total: d.total,
        percentage: percentage,
        timestamp: timestamp
      });
    });
    
    // Render the table with all data
    renderResultsTable(allResultsData);
    
  } catch (err) {
    resultsDiv.innerHTML = '<h3>User Test Results</h3><p style="color:red;">Failed to load test results: ' + err.message + '<br>Check your Firestore rules and network connection.</p>';
    console.error('Failed to load test results:', err);
  }
}

// Store results data for filtering and export
let allResultsData = [];

// Filter results based on search term
function filterResults(searchTerm) {
  const resultsDiv = document.getElementById('admin-test-results');
  if (!resultsDiv || !allResultsData.length) return;
  
  const filteredData = allResultsData.filter(result => {
    const searchLower = searchTerm.toLowerCase();
    return (
      result.name.toLowerCase().includes(searchLower) ||
      result.phone.toLowerCase().includes(searchLower) ||
      result.testTitle.toLowerCase().includes(searchLower)
    );
  });
  
  renderResultsTable(filteredData);
}

// Export results to CSV
async function exportResultsToCSV() {
  try {
    if (!allResultsData.length) {
      alert('No results to export. Please refresh the results first.');
      return;
    }
    
    // Create CSV content
    const headers = ['Full Name', 'Phone Number', 'Test Name', 'Score', 'Percentage', 'Date & Time'];
    const csvContent = [
      headers.join(','),
      ...allResultsData.map(result => [
        `"${result.name}"`,
        `"${result.phone}"`,
        `"${result.testTitle}"`,
        `${result.score}/${result.total}`,
        `${result.percentage}%`,
        `"${result.timestamp}"`
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `test_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Results exported successfully!');
  } catch (err) {
    console.error('Export failed:', err);
    alert('Export failed: ' + err.message);
  }
}

// Helper function to render results table
function renderResultsTable(resultsData) {
  const resultsDiv = document.getElementById('admin-test-results');
  if (!resultsDiv) return;
  
  let html = '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">';
  html += '<h3 style="margin:0;">User Test Results</h3>';
  html += '<div style="display:flex; gap:10px; flex-wrap:wrap;">';
  html += '<input type="text" id="results-search" placeholder="Search by name, phone, or test..." style="padding:8px; border:1px solid #ddd; border-radius:4px; width:250px; min-width:200px;">';
  html += '<button id="refresh-results-btn" class="btn" style="background:#17a2b8; font-size:0.9rem; padding:8px 16px;"><i class="fas fa-sync-alt"></i> Refresh</button>';
  html += '<button id="export-results-btn" class="btn" style="background:#28a745; font-size:0.9rem; padding:8px 16px;"><i class="fas fa-download"></i> Export CSV</button>';
  html += '<button id="show-user-stats-btn" class="btn" style="background:#6f42c1; font-size:0.9rem; padding:8px 16px;"><i class="fas fa-chart-bar"></i> User Stats</button>';
  html += '</div></div>';
  
  if (resultsData.length === 0) {
    html += '<p>No results found.</p>';
    resultsDiv.innerHTML = html;
    return;
  }
  
  html += '<div style="overflow-x:auto; margin-top:20px;">';
  html += '<table style="width:100%; border-collapse:collapse; background:white; box-shadow:0 2px 8px rgba(0,0,0,0.1); border-radius:8px; overflow:hidden;">';
  html += '<thead style="background:#f8f9fa;">';
  html += '<tr>';
  html += '<th style="border:1px solid #dee2e6; padding:12px 8px; text-align:left; font-weight:600; color:#495057;">Full Name</th>';
  html += '<th style="border:1px solid #dee2e6; padding:12px 8px; text-align:left; font-weight:600; color:#495057;">Phone Number</th>';
  html += '<th style="border:1px solid #dee2e6; padding:12px 8px; text-align:left; font-weight:600; color:#495057;">Test Name</th>';
  html += '<th style="border:1px solid #dee2e6; padding:12px 8px; text-align:center; font-weight:600; color:#495057;">Score</th>';
  html += '<th style="border:1px solid #dee2e6; padding:12px 8px; text-align:center; font-weight:600; color:#495057;">Percentage</th>';
  html += '<th style="border:1px solid #dee2e6; padding:12px 8px; text-align:left; font-weight:600; color:#495057;">Date & Time</th>';
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';
  
  resultsData.forEach(result => {
    let scoreColor = '#dc3545'; // red for low scores
    if (result.percentage >= 80) scoreColor = '#28a745'; // green for high scores
    else if (result.percentage >= 60) scoreColor = '#ffc107'; // yellow for medium scores
    
    html += '<tr style="border-bottom:1px solid #dee2e6;">';
    html += `<td style="border:1px solid #dee2e6; padding:12px 8px; font-weight:500;">${result.name || 'N/A'}</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:12px 8px;">${result.phone || 'N/A'}</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:12px 8px;">${result.testTitle || 'N/A'}</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:12px 8px; text-align:center; font-weight:600;">${result.score} / ${result.total}</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:12px 8px; text-align:center; font-weight:600; color:${scoreColor};">${result.percentage}%</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:12px 8px;">${result.timestamp}</td>`;
    html += '</tr>';
  });
  
  html += '</tbody>';
  html += '</table>';
  html += '</div>';
  
  // Add summary statistics
  html += `<div style="margin-top:20px; padding:15px; background:#e9ecef; border-radius:8px;">`;
  html += `<p style="margin:0; font-weight:600;">Showing ${resultsData.length} results</p>`;
  html += '</div>';
  
  resultsDiv.innerHTML = html;
  
  // Re-attach event listeners
  const newRefreshBtn = document.getElementById('refresh-results-btn');
  const newExportBtn = document.getElementById('export-results-btn');
  const newSearchInput = document.getElementById('results-search');
  const newUserStatsBtn = document.getElementById('show-user-stats-btn');
  
  if (newRefreshBtn) {
    newRefreshBtn.addEventListener('click', function() {
      renderAdminTestResults();
    });
  }
  
  if (newExportBtn) {
    newExportBtn.addEventListener('click', function() {
      exportResultsToCSV();
    });
  }
  
  if (newSearchInput) {
    newSearchInput.addEventListener('input', function() {
      filterResults(this.value);
    });
  }
  
  if (newUserStatsBtn) {
    newUserStatsBtn.addEventListener('click', function() {
      toggleUserStats();
    });
  }
}

// Toggle user statistics section
function toggleUserStats() {
  if (!userStatsSection) return;
  
  if (userStatsSection.style.display === 'none') {
    userStatsSection.style.display = 'block';
    renderUserStatistics();
  } else {
    userStatsSection.style.display = 'none';
  }
}

// Render user statistics
function renderUserStatistics() {
  const statsContent = document.getElementById('user-stats-content');
  if (!statsContent || !allResultsData.length) {
    if (statsContent) {
      statsContent.innerHTML = '<p>No data available for statistics.</p>';
    }
    return;
  }
  
  // Group results by user (name + phone combination)
  const userStats = {};
  allResultsData.forEach(result => {
    const userKey = `${result.name}-${result.phone}`;
    if (!userStats[userKey]) {
      userStats[userKey] = {
        name: result.name,
        phone: result.phone,
        testsTaken: 0,
        totalScore: 0,
        totalQuestions: 0,
        averagePercentage: 0,
        bestScore: 0,
        testHistory: []
      };
    }
    
    userStats[userKey].testsTaken++;
    userStats[userKey].totalScore += result.score;
    userStats[userKey].totalQuestions += result.total;
    userStats[userKey].testHistory.push({
      testTitle: result.testTitle,
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      timestamp: result.timestamp
    });
    
    if (result.percentage > userStats[userKey].bestScore) {
      userStats[userKey].bestScore = result.percentage;
    }
  });
  
  // Calculate averages
  Object.values(userStats).forEach(user => {
    user.averagePercentage = Math.round(user.totalScore / user.totalQuestions * 100);
  });
  
  // Sort by average percentage (descending)
  const sortedUsers = Object.values(userStats).sort((a, b) => b.averagePercentage - a.averagePercentage);
  
  // Render statistics
  let html = '<div style="display:grid; gap:20px;">';
  
  // Overall statistics
  html += '<div style="background:white; padding:20px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">';
  html += '<h4 style="margin:0 0 15px 0; color:#495057;">Overall Statistics</h4>';
  html += '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">';
  html += `<div><strong>Total Users:</strong> ${sortedUsers.length}</div>`;
  html += `<div><strong>Total Tests Taken:</strong> ${allResultsData.length}</div>`;
  html += `<div><strong>Average Score:</strong> ${Math.round(allResultsData.reduce((sum, r) => sum + r.percentage, 0) / allResultsData.length)}%</div>`;
  html += `<div><strong>Best Individual Score:</strong> ${Math.max(...allResultsData.map(r => r.percentage))}%</div>`;
  html += '</div></div>';
  
  // Individual user statistics
  html += '<div style="background:white; padding:20px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">';
  html += '<h4 style="margin:0 0 15px 0; color:#495057;">Individual User Performance</h4>';
  html += '<div style="overflow-x:auto;">';
  html += '<table style="width:100%; border-collapse:collapse;">';
  html += '<thead style="background:#f8f9fa;">';
  html += '<tr>';
  html += '<th style="border:1px solid #dee2e6; padding:8px; text-align:left;">Name</th>';
  html += '<th style="border:1px solid #dee2e6; padding:8px; text-align:left;">Phone</th>';
  html += '<th style="border:1px solid #dee2e6; padding:8px; text-align:center;">Tests Taken</th>';
  html += '<th style="border:1px solid #dee2e6; padding:8px; text-align:center;">Average %</th>';
  html += '<th style="border:1px solid #dee2e6; padding:8px; text-align:center;">Best Score</th>';
  html += '<th style="border:1px solid #dee2e6; padding:8px; text-align:center;">Actions</th>';
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';
  
  sortedUsers.forEach((user, index) => {
    const avgColor = user.averagePercentage >= 80 ? '#28a745' : user.averagePercentage >= 60 ? '#ffc107' : '#dc3545';
    const bestColor = user.bestScore >= 80 ? '#28a745' : user.bestScore >= 60 ? '#ffc107' : '#dc3545';
    
    html += '<tr>';
    html += `<td style="border:1px solid #dee2e6; padding:8px; font-weight:500;">${user.name}</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:8px;">${user.phone}</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:8px; text-align:center;">${user.testsTaken}</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:8px; text-align:center; font-weight:600; color:${avgColor};">${user.averagePercentage}%</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:8px; text-align:center; font-weight:600; color:${bestColor};">${user.bestScore}%</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:8px; text-align:center;">`;
    html += `<button onclick="showUserDetails('${user.name}', '${user.phone}')" class="btn" style="background:#17a2b8; font-size:0.8rem; padding:4px 8px;">View Details</button>`;
    html += '</td>';
    html += '</tr>';
  });
  
  html += '</tbody>';
  html += '</table>';
  html += '</div></div>';
  
  html += '</div>';
  statsContent.innerHTML = html;
}

// Show detailed user information
function showUserDetails(userName, userPhone) {
  const userKey = `${userName}-${userPhone}`;
  const userStats = {};
  
  // Recreate user stats for this specific user
  allResultsData.forEach(result => {
    const key = `${result.name}-${result.phone}`;
    if (key === userKey) {
      if (!userStats[userKey]) {
        userStats[userKey] = {
          name: result.name,
          phone: result.phone,
          testsTaken: 0,
          totalScore: 0,
          totalQuestions: 0,
          averagePercentage: 0,
          bestScore: 0,
          testHistory: []
        };
      }
      
      userStats[userKey].testsTaken++;
      userStats[userKey].totalScore += result.score;
      userStats[userKey].totalQuestions += result.total;
      userStats[userKey].testHistory.push({
        testTitle: result.testTitle,
        score: result.score,
        total: result.total,
        percentage: result.percentage,
        timestamp: result.timestamp
      });
      
      if (result.percentage > userStats[userKey].bestScore) {
        userStats[userKey].bestScore = result.percentage;
      }
    }
  });
  
  const user = userStats[userKey];
  if (!user) return;
  
  user.averagePercentage = Math.round(user.totalScore / user.totalQuestions * 100);
  
  // Create modal for user details
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); display: flex; justify-content: center; 
    align-items: center; z-index: 1000;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white; padding: 30px; border-radius: 12px; 
    max-width: 600px; max-height: 80vh; overflow-y: auto;
  `;
  
  let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">`;
  html += `<h3 style="margin:0;">${user.name} - Test History</h3>`;
  html += `<button onclick="this.closest('.modal').remove()" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>`;
  html += '</div>';
  
  html += '<div style="margin-bottom:20px; padding:15px; background:#f8f9fa; border-radius:8px;">';
  html += `<p><strong>Phone:</strong> ${user.phone}</p>`;
  html += `<p><strong>Total Tests:</strong> ${user.testsTaken}</p>`;
  html += `<p><strong>Average Score:</strong> ${user.averagePercentage}%</p>`;
  html += `<p><strong>Best Score:</strong> ${user.bestScore}%</p>`;
  html += '</div>';
  
  html += '<h4>Test History</h4>';
  html += '<div style="overflow-x:auto;">';
  html += '<table style="width:100%; border-collapse:collapse;">';
  html += '<thead style="background:#f8f9fa;">';
  html += '<tr>';
  html += '<th style="border:1px solid #dee2e6; padding:8px; text-align:left;">Test</th>';
  html += '<th style="border:1px solid #dee2e6; padding:8px; text-align:center;">Score</th>';
  html += '<th style="border:1px solid #dee2e6; padding:8px; text-align:center;">Percentage</th>';
  html += '<th style="border:1px solid #dee2e6; padding:8px; text-align:left;">Date</th>';
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';
  
  user.testHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(test => {
    const scoreColor = test.percentage >= 80 ? '#28a745' : test.percentage >= 60 ? '#ffc107' : '#dc3545';
    html += '<tr>';
    html += `<td style="border:1px solid #dee2e6; padding:8px;">${test.testTitle}</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:8px; text-align:center;">${test.score}/${test.total}</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:8px; text-align:center; font-weight:600; color:${scoreColor};">${test.percentage}%</td>`;
    html += `<td style="border:1px solid #dee2e6; padding:8px;">${test.timestamp}</td>`;
    html += '</tr>';
  });
  
  html += '</tbody>';
  html += '</table>';
  html += '</div>';
  
  modalContent.innerHTML = html;
  modal.appendChild(modalContent);
  modal.className = 'modal';
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Render all registered users in the admin panel
async function renderAdminUsers() {
  const usersDiv = document.getElementById('admin-users-list');
  if (!usersDiv) return;
  usersDiv.innerHTML = '<p>Loading users...</p>';
  try {
    if (!db) {
      usersDiv.innerHTML = '<p style="color:red;">Firestore is not available. Please check your Firebase setup.</p>';
      return;
    }
    const usersSnap = await db.collection('users').orderBy('createdAt', 'desc').get();
    if (usersSnap.empty) {
      usersDiv.innerHTML = '<p>No users found.</p>';
      return;
    }
    let html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;background:white;box-shadow:0 2px 8px rgba(0,0,0,0.1);border-radius:8px;overflow:hidden;">';
    html += '<thead style="background:#f8f9fa;"><tr>';
    html += '<th style="border:1px solid #dee2e6;padding:8px;">Name</th>';
    html += '<th style="border:1px solid #dee2e6;padding:8px;">Email</th>';
    html += '<th style="border:1px solid #dee2e6;padding:8px;">Phone</th>';
    html += '<th style="border:1px solid #dee2e6;padding:8px;">Registered</th>';
    html += '<th style="border:1px solid #dee2e6;padding:8px;">ID Front</th>';
    html += '<th style="border:1px solid #dee2e6;padding:8px;">ID Back</th>';
    html += '</tr></thead><tbody>';
    usersSnap.forEach(doc => {
      const d = doc.data();
      html += '<tr>';
      html += `<td style=\"border:1px solid #dee2e6;padding:8px;\"><a href='#' class='admin-user-link' data-uid='${doc.id}' style='color:#1838eb; text-decoration:underline; cursor:pointer;'>${d.name || ''}</a></td>`;
      html += `<td style=\"border:1px solid #dee2e6;padding:8px;\">${d.email || ''}</td>`;
      html += `<td style=\"border:1px solid #dee2e6;padding:8px;\">${d.phone || ''}</td>`;
      html += `<td style=\"border:1px solid #dee2e6;padding:8px;\">${d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleString() : ''}</td>`;
      html += `<td style=\"border:1px solid #dee2e6;padding:8px;\">${d.idFrontUrl ? `<a href='${d.idFrontUrl}' target='_blank'>View</a>` : ''}</td>`;
      html += `<td style=\"border:1px solid #dee2e6;padding:8px;\">${d.idBackUrl ? `<a href='${d.idBackUrl}' target='_blank'>View</a>` : ''}</td>`;
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    usersDiv.innerHTML = html;
    // Add click event listeners to user links
    usersDiv.querySelectorAll('.admin-user-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const uid = this.getAttribute('data-uid');
        showAdminUserModal(uid);
      });
    });
  } catch (err) {
    usersDiv.innerHTML = '<p style="color:red;">Failed to load users: ' + err.message + '</p>';
    console.error('Failed to load users:', err);
  }
}

// Show modal with user info and submissions
async function showAdminUserModal(uid) {
  try {
    if (!db) return;
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return;
    const d = userDoc.data();
    // Fetch all test submissions for this user
    const resultsSnap = await db.collection('testResults').where('userId', '==', uid).orderBy('timestamp', 'desc').get();
    // Modal HTML
    let html = `<div style='padding:20px; max-width:500px;'>`;
    html += `<h3 style='margin-top:0;'>${d.name || ''}</h3>`;
    html += `<p><strong>Email:</strong> ${d.email || ''}<br>`;
    html += `<strong>Phone:</strong> ${d.phone || ''}<br>`;
    html += `<strong>Registered:</strong> ${d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleString() : ''}</p>`;
    html += `<p><strong>ID Front:</strong> ${d.idFrontUrl ? `<a href='${d.idFrontUrl}' target='_blank'>View</a>` : 'N/A'}<br>`;
    html += `<strong>ID Back:</strong> ${d.idBackUrl ? `<a href='${d.idBackUrl}' target='_blank'>View</a>` : 'N/A'}</p>`;
    html += `<h4 style='margin-top:24px;'>Test Submissions</h4>`;
    if (resultsSnap.empty) {
      html += '<p>No test submissions found for this user.</p>';
    } else {
      html += `<div style='overflow-x:auto;'><table style='width:100%;border-collapse:collapse;'><thead><tr><th style='border:1px solid #dee2e6;padding:6px;'>Test</th><th style='border:1px solid #dee2e6;padding:6px;'>Score</th><th style='border:1px solid #dee2e6;padding:6px;'>Date</th></tr></thead><tbody>`;
      resultsSnap.forEach(doc => {
        const r = doc.data();
        html += `<tr><td style='border:1px solid #dee2e6;padding:6px;'>${r.testTitle || ''}</td><td style='border:1px solid #dee2e6;padding:6px;'>${r.score} / ${r.total}</td><td style='border:1px solid #dee2e6;padding:6px;'>${r.timestamp && r.timestamp.toDate ? r.timestamp.toDate().toLocaleString() : ''}</td></tr>`;
      });
      html += '</tbody></table></div>';
    }
    html += `</div>`;
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;`;
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `background:white;border-radius:10px;max-width:520px;width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 2px 16px rgba(0,0,0,0.18);`;
    modalContent.innerHTML = `<button style='float:right;font-size:1.5rem;background:none;border:none;cursor:pointer;' onclick='this.closest(".admin-user-modal").remove()'>&times;</button>` + html;
    modal.className = 'admin-user-modal';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    // Close modal on background click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.remove();
    });
  } catch (err) {
    alert('Failed to load user info: ' + err.message);
    console.error('Failed to load user info:', err);
  }
}

// Render a compact list of users who have submitted at least one test
async function renderSubmittedUsers() {
  const usersDiv = document.getElementById('submitted-users-list');
  if (!usersDiv) return;
  usersDiv.innerHTML = 'Loading...';
  try {
    if (!db) {
      usersDiv.innerHTML = '<span style="color:red;">Firestore is not available.</span>';
      return;
    }
    // Get all test results
    const resultsSnap = await db.collection('testResults').get();
    if (resultsSnap.empty) {
      usersDiv.innerHTML = 'No users have submitted tests yet.';
      return;
    }
    // Collect unique userIds
    const userIds = new Set();
    const userInfoMap = {};
    resultsSnap.forEach(doc => {
      const d = doc.data();
      if (d.userId) {
        userIds.add(d.userId);
        userInfoMap[d.userId] = { name: d.userName, email: d.userEmail };
      } else if (d.userEmail) {
        // fallback for legacy data
        userInfoMap[d.userEmail] = { name: d.userName, email: d.userEmail };
      }
    });
    // Fetch user details from users collection for phone numbers
    let usersSnap = null;
    try {
      usersSnap = await db.collection('users').get();
    } catch {}
    const usersMap = {};
    if (usersSnap) {
      usersSnap.forEach(doc => {
        usersMap[doc.id] = doc.data();
      });
    }
    // Build list
    let html = '<ul style="list-style:none; padding:0; margin:0;">';
    let count = 0;
    userIds.forEach(uid => {
      const info = userInfoMap[uid] || {};
      const user = usersMap[uid] || {};
      html += `<li style=\"margin-bottom:6px;\"><strong>${info.name || user.name || 'Unknown'}</strong> &lt;${info.email || user.email || ''}&gt;${user.phone ? ' - ' + user.phone : ''}</li>`;
      count++;
    });
    if (count === 0) html += '<li>No users have submitted tests yet.</li>';
    html += '</ul>';
    usersDiv.innerHTML = html;
  } catch (err) {
    usersDiv.innerHTML = '<span style="color:red;">Failed to load users: ' + err.message + '</span>';
    console.error('Failed to load submitted users:', err);
  }
}

if (adminSetTimingForm) {
  adminSetTimingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!db) {
      alert('Firestore is not available. Please check your Firebase setup.');
      return;
    }
    const testIdx = parseInt(adminTimingTestSelect.value);
    if (isNaN(testIdx) || !testsData[testIdx]) {
      alert('Please select a valid test.');
      return;
    }
    const start = adminStartTime.value;
    const end = adminEndTime.value;
    if (!start || !end) {
      alert('Please select both start and end times.');
      return;
    }
    try {
      // Save timing to Firestore under the test document
      const testId = testsData[testIdx].id;
      if (!testId) {
        alert('Test ID not found. Please add a question to this test first.');
        return;
      }
      await db.collection('tests').doc(testId).update({
        timing: {
          start: new Date(start),
          end: new Date(end)
        }
      });
      alert('Test timing saved successfully!');
    } catch (err) {
      alert('Failed to save test timing: ' + err.message);
      console.error('Failed to save test timing:', err);
    }
  });
}