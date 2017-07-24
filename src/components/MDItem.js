import React from 'react';

import '../styles/MDItem.css';

import {ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';

const MDItem = ({item, isEditing, onItemClick}) => {
  if (isEditing)
    return (
      <ListItem
        leftCheckbox={
          <Checkbox
            checked={item.isVisible}
            onClick={onItemClick}
          />
        }
        primaryText={item.value}
        secondaryText={item.key}
       />
   )
  else
    return (
      <ListItem disabled={true}
        style={{padding: '5px 16px' }}
        primaryText={item.value}
        secondaryText={item.key}
       />
    )
}

export default MDItem;
