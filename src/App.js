import React from 'react';
import recycle from 'recycle';
import './App.css';
import Header from './Header';
import Info from './containers/Info'

function findUser() {
  console.log("called findUser");
}

const App = recycle({

  view (props, state) {
    return (
      <div className="App">
        <Header findUser={findUser}></Header>
        <Info />
    );
  }
});

export default App;
