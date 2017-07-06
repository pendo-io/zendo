import React from 'react';

import MDItem from './MDItem';

const MDGroup = ({name, items}) => (
  <div className="md-group">
    <label>{name}</label>
    <ul >
      {items.map((item) =>
        <MDItem item={item} />
      )}
    </ul>
  </div>
)

export default MDGroup;
