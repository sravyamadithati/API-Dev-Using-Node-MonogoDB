import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './leaflet';

const map = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');

if (map) {
   const locations = JSON.parse(map.dataset.locations);
   displayMap(locations);
}

if (loginForm) {
   loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      console.log(email, password);
      login(email, password);
   });
}

if (logOutBtn) {
   logOutBtn.addEventListener('click', logout);
}
