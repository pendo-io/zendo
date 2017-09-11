import React/*, { Component }*/ from 'react';
import Rx from 'rxjs';
import R from 'ramda';
import recycle from 'recycle';
import muiThemeable from 'material-ui/styles/muiThemeable';
import IconButton from 'material-ui/IconButton';
import Streams from '../Streams';
import ZAF from '../sources/ZAFClient';

import Pendo from '../sources/PendoClient';

import '../styles/Header.css';

const Header = recycle({
  initialState: {
    avatarUrl: '',
    id: '',
    name: '',
    email: '',
    zdEmail: '',
    organizations: [],
    canOpen: false,
    error: null
  },
  update (sources) {
    return [
      sources.select('button')
        .addListener('onClick')
        .reducer((state) => {
          console.log("got click on change user link");
          return state;
        }),
      sources.select(IconButton)
        .addListener('onClick')
        .reducer((state) => {
          window.open(`${Pendo.url}/visitor/${state.id}`, '_newtab');
          return state;
        }),

      ZAF.getEmail()
        .reducer((state, zdEmail) => {
          state.zdEmail = zdEmail || 'email missing';
          return state;
        }),

      Streams.getAvatarUrlStream()
        .reducer( (state, aus) => {
          state.avatarUrl = aus;
          return state;
        }),

      Streams.getVisitorStream()
        .catch( e => Rx.Observable.of(e) )
        .reducer( (state, pendoVisitor) => {

          if (R.is(Error, pendoVisitor)) {
            state.error = "No Visitor Found";
            return state;
          }

          // add better way to get email
          state.id = pendoVisitor.id;
          state.email = pendoVisitor.email || pendoVisitor.id;
          state.name = pendoVisitor.displayName || state.email;

          state.canOpen = true;

          return state;
        }),

      Streams.getAccountStream()
        .catch( e => Rx.Observable.of(e) )
        .reducer( (state, pendoAccount) => {
          if (R.is(Error, pendoAccount)) {
            console.log("Got error", pendoAccount)
            return state;
          }
          state.organizations = [pendoAccount.name || pendoAccount.id];
          return state;
        })
    ]
  },
  effects (sources) {
    return [
      sources.select('button')
        .addListener('onClick')
        .withLatestFrom(sources.props)
        .map(([e,props]) => props.findUser() )
    ]
  },
  view (props, state) {
    return (
      <div className="header" style={{'background-color':props.muiTheme.palette.primary1Color}}>
        <img src={state.avatarUrl} alt="" height="40px" width="40px" />
        <h2 title={state.name || ''}>
          {state.name || state.error}
          {!state.error && !!state.organizations.length &&
            <div>
              from {state.organizations.join(', ')}
            </div>
          }
          {!state.error && !state.organizations.length &&
            <div>
              <i>No Account for Visitor</i>
            </div>
          }
          {!!state.error &&
            <div>
              unable to find {state.zdEmail}
            </div>
          }
        </h2>
        {/*This is how you make comments*/}
        {/*<button className="change-user">Change user</button>*/}
        {!state.error && state.canOpen &&
          <IconButton iconClassName='material-icons' iconStyle={{color:'#fff'}}
            style={{position: 'absolute', top: '5px', right: '5px'}}
            tooltip='Open in Pendo' tooltipPosition='bottom-left'>
            open_in_new
          </IconButton>
        }
      </div>
    );
  }
})

export default muiThemeable()(Header);
