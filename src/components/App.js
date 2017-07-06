import React from 'react';
import { render } from 'react-dom';

import '../styles/App.css';
import Header from '../containers/Header';
import VisitorMDContainer from '../containers/VisitorMDContainer';
import AccountMDContainer from '../containers/AccountMDContainer';

function findUser() {
  console.log("called findUser");
}

const App = () => (
  <div className="App">
    <Header findUser={findUser}></Header>
    <VisitorMDContainer/>
    <AccountMDContainer/>
  </div>
);

export default App;
