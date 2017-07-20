import React from 'react';
import _ from 'underscore';
import R from 'ramda';

import MDGroup from './MDGroup';

import '../styles/MDList.css';

// const isEditing = (items) => {
//   return R.any(R.propEq('isEditing', true), items);
// };

const addGroup = (group, name) => (
  <MDGroup
    name={name}
    items={group}
  />
)

//     {R.mapObjIndexed(addGroup, R.groupBy(R.prop('group'), items))}

// {_.map(_.groupBy(items, 'group'), addGroup )}
//    {_.map(items, addGroup )}
const MDList = ({ items, isEditing, onEdit, onSave }) => (
  <div className="md-list">
    {R.values(R.mapObjIndexed(addGroup, items))}
    <div className="footer">
      <button onClick={() => isEditing ? onSave() : onEdit()}>{isEditing ? 'Done' : 'Edit'}</button>
    </div>
  </div>
)

export default MDList;
