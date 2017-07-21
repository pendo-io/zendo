import React from 'react';
import R from 'ramda';

import MDGroup from './MDGroup';

// this is the card?
import {Card, CardActions} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import '../styles/MDList.css';

const addGroup = (isEditing, group, name) => (
  <MDGroup
    name={name}
    items={group}
    isEditing={isEditing}
  />
)

const MDList = ({ items, isEditing, onEdit, onSave }) => (
  <Card>
    {R.values(R.mapObjIndexed(R.partial(addGroup, [isEditing]), items))}
    <CardActions>
      <FlatButton label={isEditing ? 'Done' : 'Edit'} onTouchTap={() => isEditing ? onSave() : onEdit()}></FlatButton>
    </CardActions>
  </Card>
)

export default MDList;
