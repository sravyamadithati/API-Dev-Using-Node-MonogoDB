import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './leaflet';

const map = document.getElementById('map');
const loginForm = document.querySelector('.form');

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
