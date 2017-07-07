import React from 'react';

import '../styles/App.css';
import Header from '../containers/Header';
import VisitorMDContainer from '../containers/VisitorMDContainer';
import AccountMDContainer from '../containers/AccountMDContainer';
import '../styles/MDListContainer.css';

function findUser() {
  console.log("called findUser");
}

const App = () => (
  <div className="App">
    <Header findUser={findUser}></Header>
    <div className="scroll-area">
      <VisitorMDContainer/>
      <AccountMDContainer/>
    </div>
  </div>
);

export default App;
