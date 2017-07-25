import React from 'react';

import MDItem from './MDItem';

import List from 'material-ui/List';
import Subheader from "material-ui/Subheader";

import {ToggleMetadataAction} from '../actions';

import '../styles/MDGroup.css';

const MDGroup = ({name, items, isEditing, type}) => (
  <List style={{padding:'0px'}}>
    {isEditing &&
      <Subheader>{name}</Subheader>
    }
    {items.map((item) =>
      <MDItem item={item} isEditing={isEditing} onItemClick={() => ToggleMetadataAction(type, name, item) }/>
    )}
  </List>
)

export default MDGroup;
