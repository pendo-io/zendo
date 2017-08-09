import R from 'ramda';

import Storage from '../sources/Storage';

export const ToggleMetadataAction = (type, groupName, item) => {

  // apply change
  item.isVisible = !item.isVisible;

  // persist change
  const key = type.toLowerCase() === 'visitor' ? 'visitor-metadata-filter' : 'account-metadata-filter';

  const tStore = Storage.getCommonStorage();
  const filter = tStore.read(key);

  const newFilter = R.concat(R.reject(R.propEq('key', groupName+'-'+item.key), filter),
    R.map((f) => {
      f.key = groupName+'-'+f.key;
      return f;
    }, [R.omit(['group', 'value'], item)]) );
  tStore.write( key, newFilter );
}
