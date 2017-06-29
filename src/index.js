import React from 'react';
import { render } from 'react-dom';
import App from './App';
import {start, /*getEmail, getMetadata, getContext, getRequester*/} from './ZAFClient';
import './index.css';

start();

render(
  <App />,
  document.getElementById('root')
);


// getEmail().then((email) => {
//   console.log(`got email: ${email}`);
// });
// getMetadata();
// getContext();
// getRequester().then((obj) => {
//   console.log(obj);
// })
