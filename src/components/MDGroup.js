import React from 'react';

import MDItem from './MDItem';

import '../styles/MDGroup.css';

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
