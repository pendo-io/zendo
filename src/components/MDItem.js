import React from 'react';

import {ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';

import dateformat from 'dateformat';

const applySchema = (value, schema) => {
  if (schema.Type === 'time' && !!value) {
    return dateformat(new Date(value), "fullDate");
  }

  return value;
};

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
        primaryText={applySchema(item.value, item.schema) || item.schema.sample + ' (sample)'}
        secondaryText={item.schema.DisplayName || item.key}
       />
   )
  else
    return (
      <ListItem disabled={true}
        style={{padding: '5px 16px' }}
        primaryText={
          <span>{applySchema(item.value, item.schema)}</span>
        }
        secondaryText={item.schema.DisplayName || item.key}
      />
    )
}

export default MDItem;
