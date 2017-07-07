import React from 'react';
import _ from 'underscore';

import MDGroup from './MDGroup';

import '../styles/MDList.css';

const isEditing = (items) => {
  return _.any(items, (item) => item.isEditing);
};

const MDList = ({ items, onEdit, onSave }) => (
  <div className="md-list">
    {_.map(_.groupBy(items, 'group'), (group, name) =>
        <MDGroup
          name={name}
          items={group}
        />
    )}
    <div className="footer">
      <button onClick={() => isEditing(items) ? onSave() : onEdit()}>{isEditing(items) ? 'Save' : 'Edit'}</button>
    </div>
  </div>
)

export default MDList;
