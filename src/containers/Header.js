import React/*, { Component }*/ from 'react';
import recycle from 'recycle';
import muiThemeable from 'material-ui/styles/muiThemeable';
import IconButton from 'material-ui/IconButton';
import Streams from '../Streams';

import Pendo from '../sources/PendoClient';

import '../styles/Header.css';

const Header = recycle({
  initialState: {
    avatarUrl: '',
    id: '',
    name: '',
    email: '',
    organizations: []
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
          // TODO: fix this, it might not be email
          window.open(`${Pendo.url}/visitor/${state.id}`, '_newtab');
          return state;
        }),

      Streams.getAvatarUrlStream()
        .reducer( (state, aus) => {
          state.avatarUrl = aus;
          return state;
        }),

      Streams.getVisitorStream()
        .reducer( (state, pendoVisitor) => {
          // add better way to get email
          state.id = pendoVisitor.id;
          state.email = pendoVisitor.id;
          state.name = pendoVisitor.displayName || state.email;
          return state;
        }),

      Streams.getAccountStream()
        .reducer( (state, pendoAccount) => {
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
        <h2>
          {state.name}
          <div>
            from {state.organizations.join(', ')}
          </div>
        </h2>
        {/*This is how you make comments*/}
        {/*<button className="change-user">Change user</button>*/}
        <IconButton iconClassName='material-icons' iconStyle={{color:'#fff'}}
          style={{position: 'absolute', top: '5px', right: '5px'}}
          tooltip='Open in Pendo' tooltipPosition='bottom-left'>
          open_in_new
        </IconButton>
      </div>
    );
  }
})

export default muiThemeable()(Header);
