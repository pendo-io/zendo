import React from 'react';

import '../styles/App.css';
import Header from '../containers/Header';

import '../styles/MDListContainer.css';

import factory from '../containers/MDContainerFactory';
import Streams from '../Streams';

const VisitorMDContainer = factory(
  'Visitor',
  Streams.getVisitorStream().map(visitor => visitor.metadata),
  Streams.getVisitorMetadataFilter()
);

const AccountMDContainer = factory(
  'Account',
  Streams.getAccountStream().map(acct => acct.metadata),
  Streams.getAccountMetadataFilter()
)

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
