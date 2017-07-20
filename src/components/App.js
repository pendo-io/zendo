import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  Switch
} from 'react-router-dom';

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

const Info = () => (
  <div>
    <VisitorMDContainer/>
    <AccountMDContainer/>
  </div>
)
const NotBuilt = () => (
  <div>
    <h2>Not built yet</h2>
  </div>
)

const NoMatch = () => (
  <Redirect to="/" />
)

function findUser() {
  console.log("called findUser");
}

const App = () => (
  <div className="App">
    <Header findUser={findUser}></Header>
    <Router>
      <div>
        <ul className='navigation-links'>
          <li><Link to="/">Info</Link></li>
          <li><Link to="/timeline">Timeline</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
        <div className="scroll-area">
          <Switch>
            <Route exact path="/" component={Info} />
            <Route path="/timeline" component={NotBuilt} />
            <Route path="/settings" component={NotBuilt} />
            <Route component={NoMatch} />
          </Switch>
        </div>
      </div>
    </Router>
  </div>
);

export default App;
