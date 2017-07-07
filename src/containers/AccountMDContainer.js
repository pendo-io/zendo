import React from 'react';
import recycle from 'recycle';
import _ from 'underscore';

import Streams from '../Streams'
import MDList from '../components/MDList';

const getVisibleItems = (items, filter, isEditing) => {
  if (isEditing) {
    return items.map((item) => {
      item.isVisible = !!_.findWhere(filter, {key: item.key});
      return item;
    });
  }
  return _.filter(items, (item) => {
    return _.findWhere(filter, {key: item.key});
  });
}

const AccountMDContainer = recycle({
  initialState: {
    items: [],
    filter: [],
    isEditing: false
  },
  update (sources) {
    return [
      sources.select(MDList)
        .addListener('onEdit')
        .reducer((state) => {
          state.isEditing = !state.isEditing;
          // XXX here we'll persist the isVisible changes
          return state;
        }),

      sources.select(MDList)
        .addListener('onSave')
        .reducer((state) => {
          state.isEditing = false;

          // TODO: save changes here

          state.items = _.map(state.items,
              (item) => _.omit(item, ['isEditing', 'isVisible']));
          return state;
        }),

      Streams.getAccountMetadataFilter()
        .reducer( (state, filter) => {
          state.filter = filter;
          return state;
        }),

      Streams.getAccountStream()
        .map( visitor => visitor.metadata )
        .reducer( (state, md) => {
          const flattr = _.map(md, (groupItems, groupName) => {
            return _.map(groupItems, (itemValue, itemName) => {
              return {
                group: groupName,
                key: itemName,
                value: itemValue
              };
            })
          });
          state.items = _.flatten(flattr);
          return state;
        })
    ]
  },
  view (props, state) {
    return (
      <div className="md-list-container">
        <label>Account</label>
        <MDList items={getVisibleItems(state.items, state.filter, state.isEditing)} />
      </div>
    )
  }
});

export default AccountMDContainer;
