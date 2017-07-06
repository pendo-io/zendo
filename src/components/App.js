import React from 'react';
import { render } from 'react-dom';

import '../styles/App.css';
import Header from '../containers/Header';
import MDListContainer from '../containers/MDListContainer'

function findUser() {
  console.log("called findUser");
}

const App = () => (
  <div className="App">
    <Header findUser={findUser}></Header>
    <MDListContainer type="visitor"/>
  </div>
);

export default App;
