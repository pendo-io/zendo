import React/*, { Component }*/ from 'react';
import recycle from 'recycle';
import Rx from 'rxjs';
// import {Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/fromPromise';
// import 'rxjs/add/observable/withLatestFrom';
// import ZAF from './sources/ZAFClient';

import Streams from './Streams'

const Header = recycle({
  initialState: {
    avatarUrl: '',
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

      Streams.getAvatarUrlStream()
        .reducer( (state, aus) => {
          state.avatarUrl = aus;
          return state;
        }),

      Streams.getVisitorStream()
        .reducer( (state, pendoVisitor) => {
          state.email = pendoVisitor.id;
          state.name = state.email;
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
      <div className="header">
        <img src={state.avatarUrl} alt="" height="40px" width="40px" />
        <h2>
          {state.name}
          <div>
            from {state.organizations.join(', ')}
          </div>
        </h2>
        <button className="btn-link">Click to change user</button>
      </div>
    );
  }
})

export default Header;
