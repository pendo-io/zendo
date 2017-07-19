import React from 'react';
import recycle from 'recycle';
// import _ from 'underscore';
import R from 'ramda';
import MDList from '../components/MDList';

const getVisibleItems = (items, filter, isEditing) => {
  if (isEditing) {
    return items.map((item) => {
      item.isEditing = true;
      item.isVisible = !!R.find(R.propEq('key', item.key))(filter);
      // item.isVisible = !!_.findWhere(filter, {key: item.key});
      return item;
    });
  }

  return R.filter((item) => {
      return R.find(R.propEq('key', item.key))(filter);
    },
    items
  );

  // return _.filter(items, (item) => {
  //   return _.findWhere(filter, {key: item.key});
  // });
}

const factory = (type, metadataOb, metadataFilterOb) => {

  metadataOb.subscribe(console.log);

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

            state.items = R.map(R.omit(['isEditing', 'isVisible']), state.items);
            return state;
          }),

        metadataFilterOb
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
        <div className="md-list-container">
          <label>{label}</label>
          <MDList items={getVisibleItems(state.items, state.filter, state.isEditing)} />
        </div>
      )
    }
  });

}

export default factory;
