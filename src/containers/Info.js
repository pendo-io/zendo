
import React/*, { Component }*/ from 'react';
import recycle from 'recycle';
import Rx from 'rxjs';

import Streams from './Streams'
import MetadataList from '../components/MetadataList';

const Info = () => (
  <div className="info-section">
    <MetadataViewer title="VisitorMetadata" />
  </div>
)
