import React, { Component } from 'react';
import Helmet from 'react-helmet';
// import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Helmet
          title="Zendo"
          script={[
            {type:"text/javascript", src:"https://assets.zendesk.com/apps/sdk/2.0/zaf_sdk.js"}
          ]}
        />
        <p className="App-intro">
          What do you get when you cross Zendesk with Pendo?
        </p>
        <h1>ZENDO</h1>
      </div>
    );
  }
}

export default App;
