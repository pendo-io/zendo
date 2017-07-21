import React from 'react';

import MDItem from './MDItem';

import List from 'material-ui/List';
import Subheader from "material-ui/Subheader";

import '../styles/MDGroup.css';

const MDGroup = ({name, items, isEditing}) => (
  <List>
    {isEditing &&
      <Subheader>{name}</Subheader>
    }
    {items.map((item) =>
      <MDItem item={item} isEditing={isEditing} />
    )}
  </List>
)

export default MDGroup;
