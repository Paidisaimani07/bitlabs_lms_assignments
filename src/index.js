import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import initializeAnalytics from './initializeAnalytics';

initializeAnalytics();
 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="33884279909-pupqt6eev817ebnudqfgar1ei8bqtbck.apps.googleusercontent.com">
    {/* <GoogleOAuthProvider clientId="435586738795-9tuq57be4e92djg8d8ol1sn1h6a9mm6c.apps.googleusercontent.com"> */}
    <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
 
reportWebVitals();

