import React from 'react';

const MetadataList({data, onEditClick}) => (
  <div>
    <ul>
      {
        mdata.map(d =>
          <MetadataItem
        )
      }
    </ul>
    <div className="edit">
      <button>Edit</button>
    </div>
  </div>
)

export default MetadataList;
