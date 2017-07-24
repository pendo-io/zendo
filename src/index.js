import React from 'react';
import { render } from 'react-dom';

import App from './components/App';
import './styles/index.css';

import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
// import {pink300} from 'material-ui/styles/colors';
const pendoPink = '#ec2059';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: pendoPink
  }
});

const AppWrapper = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <App />
  </MuiThemeProvider>
)

render( <AppWrapper />, document.getElementById('root') );
