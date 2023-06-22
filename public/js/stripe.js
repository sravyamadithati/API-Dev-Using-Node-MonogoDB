import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
   try {
      //here Stripe object is available globally cause of the stripe script tag included in tour.pug
      const stripe = Stripe(
         'pk_test_51NFWMwSAb0aUPCfzQ4HS6U0nDTSv77wWy3haS7d2vRK7AbTjhbgnYIQMb2zjsBPt5qNbWG7sqV1u4wlSyaZVwwvZ00xv2Sh0TT'
      );
      const session = await axios(
         `/api/v1/bookings/checkout-session/${tourId}`
      );
      await stripe.redirectToCheckout({ sessionId: session.data.session.id });
   } catch (err) {
      showAlert('error', err);
   }
};
