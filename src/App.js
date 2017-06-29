import React from 'react';
import recycle from 'recycle';
import './App.css';
import Header from './Header';
// import Rx from 'rxjs';

function findUser() {
  console.log("called findUser");
}

const App = recycle({

  view (props, state) {
    return (
      <div className="App">
        <Header findUser={findUser}></Header>
        <p className="App-intro">
          What do you get when you cross Zendesk with Pendo?
        </p>
        <h1>ZENDO</h1>
        <div>
          <h2>
            Here we're adding another section
          </h2>
          <p>With some paragraph text</p>
        </div>
      </div>
    );
  }
});

export default App;
