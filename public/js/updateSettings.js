import axios from 'axios';
import { showAlert } from './alert';
//this fn is used for updating user data/password.(This check is done by using type variable)
export const updateSettings = async (data, type) => {
   try {
      const res = await axios({
         method: 'PATCH',
         url:
            type === 'data'
               ? 'api/v1/users/updateMe'
               : 'api/v1/users/updatePassword',
         data,
      });
      if (res.data.status === 'success') {
         showAlert(
            'success',
            type === 'data'
               ? 'Updated details Successfully'
               : 'Updated password Successfully'
         );
         //location.reload(true);
      }
   } catch (err) {
      showAlert('error', err.response.data.message);
   }
};
