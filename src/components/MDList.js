import React from 'react';
import R from 'ramda';

import MDGroup from './MDGroup';

import {Card, CardTitle, CardActions} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import '../styles/MDList.css';

const addGroup = (isEditing, type, group, name) => (
  <MDGroup
    name={name}
    items={group}
    isEditing={isEditing}
    type={type}
  />
)

const MDList = ({ items, isEditing, onEdit, onSave, type }) => (
  <Card style={{'box-shadow': 'none'}}>
    <CardTitle subtitle="Metadata" />
    {!R.length(R.keys(items)) &&
      <span style={{'padding-left': '15px', 'font-style':'italic', 'font-size': '12px', 'color': 'rgba(0, 0, 0, 0.54)'}}>
        Click Edit to add fields to view
      </span>
    }
    {R.values(R.mapObjIndexed(R.partial(addGroup, [isEditing, type]), items))}
    <CardActions>
      <FlatButton label={isEditing ? 'Done' : 'Edit'} onTouchTap={() => isEditing ? onSave() : onEdit()}></FlatButton>
    </CardActions>
  </Card>
)

export default MDList;
