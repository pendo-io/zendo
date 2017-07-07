import React from 'react';

import '../styles/MDItem.css';


const MDItemVisibility = ({item}) => {
  if (item.isEditing) {
    return <input type="checkbox" checked={item.isVisible}></input>;
  } else {
    return <span></span>;
  }
}


const MDItem = ({item}) => (
  <li className="md-item">
    <MDItemVisibility item={item} />
    <span className='key'>{item.key}</span>
    <span className='value'>{item.value}</span>
  </li>
)

export default MDItem;
