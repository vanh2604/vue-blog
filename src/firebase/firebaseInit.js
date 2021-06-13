import firebase from 'firebase/app';
import 'firebase/firestore';

var firebaseConfig = {
  apiKey: 'AIzaSyAAOGcY0ABh2TZS1Z1r_4FDAYdnWXwyrsg',
  authDomain: 'vue-blog-2e387.firebaseapp.com',
  projectId: 'vue-blog-2e387',
  storageBucket: 'vue-blog-2e387.appspot.com',
  messagingSenderId: '923503360304',
  appId: '1:923503360304:web:ca97867cb63e5b0dddf0f5',
  measurementId: 'G-B63FP8WCH5',
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

export { timestamp };
export default firebaseApp.firestore();
