import React from 'react';
import R from 'ramda';

import MDGroup from './MDGroup';

import '../styles/MDList.css';

const addGroup = (group, name) => (
  <MDGroup
    name={name}
    items={group}
  />
)

const MDList = ({ items, isEditing, onEdit, onSave }) => (
  <div className="md-list">
    {R.values(R.mapObjIndexed(addGroup, items))}
    <div className="footer">
      <button onClick={() => isEditing ? onSave() : onEdit()}>{isEditing ? 'Done' : 'Edit'}</button>
    </div>
  </div>
)

export default MDList;
