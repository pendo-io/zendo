import React from 'react';
import recycle from 'recycle';
import Rx from 'rxjs';
import _ from 'underscore';

import Streams from '../Streams'
import MDList from '../components/MDList';

// import '../styles/MDListContainer.css';

const getFavItems = (items) => {
  return items;
}

const VisitorMDContainer = recycle({
  initialState: {
    items: []
  },
  update (sources) {
    return [
      Streams.getVisitorStream()
        .map( visitor => visitor.metadata )
        .reducer( (state, md) => {
          state.items = _.map(md, (v, k) => {
            return {
              name: k,
              items: v
            }
          });
          return state;
        })
    ]
  },
  view (props, state) {
    return (
      <div className="md-list-container">
        <label>Visitor</label>
        <MDList items={getFavItems(state.items)} />
      </div>
    )
  }
});

export default VisitorMDContainer;
