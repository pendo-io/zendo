import React from 'react';
import { render } from 'react-dom';
import App from './App';
import ZAF from './sources/ZAFClient';
import Pendo from './sources/PendoClient';
import Rx from 'rxjs';
import './index.css';

ZAF.start();

Rx.Observable.fromPromise(ZAF.getMetadata())
  .map(obj => obj.settings.token)
  .subscribe(token => Pendo.init(token));

render( <App />, document.getElementById('root') );
