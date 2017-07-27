import React from 'react';
import recycle from 'recycle';
import R from 'ramda';
import MDList from '../components/MDList';

import Paper   from 'material-ui/Paper';
import Subheader from "material-ui/Subheader";

import MetricsList from '../components/MetricsList';

const getVisibleItems = R.pipe((items, filter, isEditing) => {
  const isVisible = o => o.isVisible
  filter = R.filter(isVisible, filter);

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

const factory = (type, metadataOb, metadataFilterOb, filterWatcher, metricsOb) => {

  // note on type: currently expected to be either 'Visitor' or 'Account'.
  // TODO: reimplement this as a Type or Enum to ensure it.

  return recycle({
    initialState: {
      items: [],
      filter: [],
      isEditing: false,
      metrics: []
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

        // TODO: figure out how to combine metadataFilterOb and filterWatcher
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
          }),

        metricsOb
          .reducer( (state, list) => {
            state.metrics = R.flatten([list]);
            return state;
          })
      ]
    },
    view (props, state) {
      const label = type;
      return (
        <div>
          <Subheader>{label} Info</Subheader>

          <Paper zDepth={1} style={{margin: '5px 5px 15px'}}>
            {!state.isEditing &&
              <MetricsList metrics={state.metrics} />
            }
            <MDList items={getVisibleItems(state.items, state.filter, state.isEditing)} isEditing={state.isEditing} type={label}/>
          </Paper>
        </div>
      )
    }
  });

}

export default factory;
