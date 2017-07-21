import React from 'react';

import '../styles/MDItem.css';

import {ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';

// const MDItemVisibility = ({item}) => {
//   if (item.isEditing) {
//     return <Checkbox checked={item.isVisible} />;
//   }
// }

const MDItem = ({item, isEditing}) => {
  if (isEditing)
    return (
      <ListItem disabled={true}
        leftCheckbox={<Checkbox checked={item.isVisible} />}
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
