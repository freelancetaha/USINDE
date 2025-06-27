const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  navToggle.classList.toggle('open');
});