import React from 'react';
// import { render } from 'react-dom';
import { render } from 'react-snapshot';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import startZAF from './ZAFWorker';
import './index.css';

render(
  <App />,
  document.getElementById('root')
);
registerServiceWorker();
startZAF();
