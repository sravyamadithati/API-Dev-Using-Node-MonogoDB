import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './leaflet';
import { updateSettings } from './updateSettings';

const map = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');

if (map) {
   const locations = JSON.parse(map.dataset.locations);
   displayMap(locations);
}

if (loginForm) {
   loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
   });
}

if (logOutBtn) {
   logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
   userDataForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const name = document.getElementById('name').value;
      updateSettings({ email, name }, 'data');
   });
}

if (userPasswordForm) {
   userPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      //we are changing btn name while updating pwd
      document.querySelector('.btn--save-password').textContent = 'Updating...';
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      await updateSettings(
         { passwordCurrent, password, passwordConfirm },
         'password'
      );
      //once pwd is updated we are changing it back to Save Password
      document.querySelector('.btn--save-password').textContent =
         'Save password';
      //we are resetting the input values.
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
   });
}
