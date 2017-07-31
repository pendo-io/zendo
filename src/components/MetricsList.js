import React from 'react';
import Subheader from 'material-ui/Subheader';
import {List,ListItem} from 'material-ui/List';

const listStyle = {
  margin: '10px 0 20px 0',
  'font-size': '15px',
  'list-style': 'none',
  'padding-left': '16px'
};

const MetricsList = ({metrics}) => (
  <div>
    <Subheader
      style={{'line-height':'16px', 'padding-top':'10px'}}
      >Metrics</Subheader>
    <List style={{padding:'0px'}}>
      {metrics.map((m) => (
        <ListItem disabled={true}
          style={{padding: '5px 16px' }}
          primaryText={
            <span>{m.value}</span>
          }
          secondaryText={m.title}
        />
      ))}
    </List>
  </div>
)

export default MetricsList;
