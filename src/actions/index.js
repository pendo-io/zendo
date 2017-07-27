import R from 'ramda';

import Storage from '../sources/Storage';

export const ToggleMetadataAction = (type, groupName, item) => {

  // apply change
  item.isVisible = !item.isVisible;

  // persist change
  const key = type.toLowerCase() === 'visitor' ? 'visitor-metadata-filter' : 'account-metadata-filter';

  const tStore = Storage.getTicketStorage();
  const filter = tStore.read(key);

  const newFilter = R.concat(R.reject(R.propEq('key', item.key), filter), [R.omit(['group', 'value'], item)] );
  tStore.write( key, newFilter );
}