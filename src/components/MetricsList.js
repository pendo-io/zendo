import React from 'react';
import Subheader from 'material-ui/Subheader';
import {List,ListItem} from 'material-ui/List';

const MetricsList = ({metrics}) => (
  <div>
    <Subheader
      style={{'line-height':'16px', 'padding-top':'10px'}}
      >Metrics</Subheader>
    <List style={{padding:'0px'}}>
      {metrics.map((m) => (
        <ListItem disabled={true}
          style={{padding: '5px 16px' }}
          primaryText={m.value}
          secondaryText={m.title}
        />
      ))}
    </List>
  </div>
)

export default MetricsList;
