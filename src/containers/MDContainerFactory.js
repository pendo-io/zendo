import React from 'react';
import recycle from 'recycle';
import R from 'ramda';
import MDList from '../components/MDList';

import Paper   from 'material-ui/Paper';
import Subheader from "material-ui/Subheader";

const getVisibleItems = R.pipe((items, filter, isEditing) => {
    if (isEditing) {
      return items.map((item) => {
        item.isVisible = !!R.find(R.propEq('key', item.key))(filter);
        return item;
      });
    }

    return R.filter((item) => R.find(R.propEq('key', item.key))(filter), items );
  },
  R.groupBy(R.prop('group'))
);

const factory = (type, metadataOb, metadataFilterOb, filterWatcher) => {
  return recycle({
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
            state.isEditing = true;
            return state;
          }),

        sources.select(MDList)
          .addListener('onSave')
          .reducer((state) => {
            state.isEditing = false;
            return state;
          }),

        metadataFilterOb
          .reducer( (state, filter) => {
            state.filter = filter;
            return state;
          }),
          
        filterWatcher
          .reducer( (state, filter) => {
            state.filter = filter;
            return state;
          }),

        metadataOb
          .reducer( (state, md) => {
            const ugh = R.values(R.mapObjIndexed((groupItems, groupName) => {
              return R.values(R.mapObjIndexed((itemValue, itemName) => {
                return { group: groupName, key: itemName, value: itemValue };
              }, groupItems));
            }, md));

            state.items = R.flatten(ugh);

            return state;
          })
      ]
    },
    view (props, state) {
      const label = type;
      return (
        <Paper zDepth={1} style={{margin: '5px 5px 15px'}}>
          <Subheader>{label} Info</Subheader>
          <MDList items={getVisibleItems(state.items, state.filter, state.isEditing)} isEditing={state.isEditing} />
        </Paper>
      )
    }
  });

}

export default factory;
