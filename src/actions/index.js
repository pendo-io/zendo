import R from 'ramda';

import Storage from '../sources/Storage';

export const ToggleMetadataAction = (type, groupName, item) => {
  item.isVisible = !item.isVisible;
  const key = type == 'visitor' ? 'visitor-metadata-filter' : 'account-metadata-filter';

  const tStore = Storage.getTicketStorage();
  const filter = tStore.read(key);

  const newFilter = R.concat(R.reject(R.propEq('key', item.key), filter), [R.omit(['group', 'value'], item)] );
  tStore.write( key, newFilter );
}
