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

    /* “Read Original” source link */
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
  fetch('news.json')
    .then(res => res.json())
    .then(newsItems => {
      const container = document.getElementById('news-container');
      if (!container) return;

      container.innerHTML = newsItems.map(item => `
        <a href="${item.link}" class="news-link" target="_blank">
          <div class="news-card">
            <img src="${item.image}" alt="${item.title}" class="news-image" />
            <div class="news-content">
              <h2>${item.title}</h2>
              <span class="news-date">
                ${new Date(item.date).toLocaleDateString()}
              </span>
              <p>${item.content}</p>
              <a 
                href="${item.source}" 
                class="news-source" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Read Original Source
              </a>
            </div>
          </div>
        </a>
      `).join('');
    })
    .catch(err => {
      console.error('Failed to load news:', err);
      const container = document.getElementById('news-container');
      if (container) container.innerHTML = '<p>Unable to load news at this time.</p>';
    });
}
