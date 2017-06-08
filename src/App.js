import React, { Component } from 'react';
import Helmet from 'react-helmet';
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
        <div>
          <h2>
            Here we're adding another section
          </h2>
          <p>With some paragraph text</p>
        </div>
      </div>
    );
  }
}

export default App;
