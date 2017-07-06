import React from 'react';
import _ from 'underscore';

import MDGroup from './MDGroup';

const convertObjectToArray = (obj) => {
  return _.map(obj, (v,k) => {
    return {key: k, value: v}
  })
};

const MDList = ({items}) => (
  <div>
    {items.map( (group) =>
        <MDGroup
          name={group.name}
          items={convertObjectToArray(group.items)}
        />
    )}
    <div className="edit">
      <button>Edit</button>
    </div>
  </div>
)

export default MDList;
