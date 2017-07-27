import React from 'react';
import Subheader from 'material-ui/Subheader';

const MetricsList = ({metrics}) => (
  <div>
    <Subheader>Metrics</Subheader>
    <ul>
      {metrics.map((m) => (
        <li>{m.title} - {m.value}</li>
      ))}
    </ul>
  </div>
)

export default MetricsList;
