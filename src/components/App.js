import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Redirect,
  Switch
} from 'react-router-dom';

import {Tabs, Tab} from 'material-ui/Tabs';

import '../styles/App.css';
import Header from '../containers/Header';
import Timeline from '../containers/Timeline';

import '../styles/MDListContainer.css';

import factory from '../containers/SectionFactory';
import Streams from '../Streams';

const VisitorSection = factory(
  'Visitor',
  Streams.getMetadata('visitor'),
  Streams.getFilter('visitor-metadata-filter'),
  Streams.watchTicketStorage('visitor-metadata-filter'),
  Streams.getVisitorMetrics()
);

const AccountSection = factory(
  'Account',
  Streams.getMetadata('account'),
  Streams.getFilter('account-metadata-filter'),
  Streams.watchTicketStorage('account-metadata-filter'),
  Streams.getAccountMetrics()
)

const Info = () => (
  <div>
    <VisitorSection/>
    <AccountSection/>
  </div>
)
const NotBuilt = () => (
  <div>
    <h2>Coming Soon</h2>
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
        <Tabs>
          <Tab label="Info" containerElement={<NavLink to="/"/>} />
          <Tab label="Timeline" containerElement={<NavLink to="/timeline"/>}/>
          {/*<Tab label="Settings" containerElement={<NavLink to="/settings"/>} /> */}
        </Tabs>
        <div className="scroll-area">
          <Switch>
            <Route exact path="/" component={Info} />
            <Route path="/timeline" component={Timeline} />
            <Route path="/settings" component={NotBuilt} />
            <Route component={NoMatch} />
          </Switch>
        </div>
      </div>
    </Router>
  </div>
);

export default App;
