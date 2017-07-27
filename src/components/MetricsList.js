import React from 'react';
import Subheader from 'material-ui/Subheader';

const listStyle = {
  margin: '10px 0 20px 0',
  'font-size': '15px',
  'list-style': 'none'
};

const MetricsList = ({metrics}) => (
  <div>
    <Subheader
      style={{'line-height':'16px', 'padding-top':'10px'}}
      >Metrics</Subheader>
    <ul style={listStyle}>
      {metrics.map((m) => (
        <li>{m.title} - {m.value}</li>
      ))}
    </ul>
  </div>
)

export default MetricsList;
