import React/*, { Component }*/ from 'react';
import recycle from 'recycle';
import {Observable} from 'rxjs/Observable';
import {getRequester} from './ZAFClient';

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

      Observable.fromPromise(getRequester())
        .reducer((state, requester) => {
          state.avatarUrl = requester.avatarUrl;
          state.name = requester.name;
          state.organizations = requester.organizations.map((org) => org.name );
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
