import React from 'react';
import { render } from 'react-dom';
import App from './App';
import {start, getEmail, getMetadata, getContext} from './ZAFWorker';
import './index.css';

render(
  <App />,
  document.getElementById('root')
);

start();
getEmail();
getMetadata();
getContext();
