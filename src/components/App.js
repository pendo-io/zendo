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
import AccountSection from '../containers/AccountSection';

import Streams from '../Streams';
import '../InstallPendo'

const VisitorMD = factory(
  'Visitor',
  Streams.getMetadata('visitor'),
  Streams.getMetadataFilter('visitor-metadata-filter'),
  Streams.getVisitorMetrics()
);

const Info = () => (
  <div>
    <VisitorMD/>
    <AccountSection/>
  </div>
)
const NotBuilt = () => (
  <div>
    <h2>Coming Soon</h2>
  </div>
)

const NoMatch = () => (
  <Redirect to="/timeline" />
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
          <Tab label="Timeline" containerElement={<NavLink to="/timeline"/>}/>
          <Tab label="Info" containerElement={<NavLink to="/info"/>} />
          {/*<Tab label="Settings" containerElement={<NavLink to="/settings"/>} /> */}
        </Tabs>
        <div className="scroll-area">
          <Switch>
            <Route path="/info" render={Info} />
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
