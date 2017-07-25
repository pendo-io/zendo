import Rx from 'rxjs';
import Store from '../vendor/es6-store.js';

class KKV {
  constructor(shardKey, onChange) {
    this.shardKey = shardKey;
    this.store = new Store(shardKey);
    this.onChange = onChange;
  }

  read (key) {
    return this.store.get(key);
  }

  write (key, value) {
    this.store.set(key, value);
    this.onChange({
      key: Storage.composeKey(this.shardKey, key),
      newValue: value
    })
  }
}

const Storage = {
  ticketStore: null,
  userStore: null,
  accountStore: null,

  composeKey (...keyPieces) {
    return keyPieces.join(':');
  },

  fromEvent () {
    const subj = new Rx.Subject();
    Storage.Observable$.subscribe(subj);
    return subj;
  },

  Observable$: new Rx.Subject(),
  emitEvent (evt) {
    Storage.Observable$.next(evt);
  },

  getTicketStorage (ticketId) {
    if (!!ticketId) {
      Storage.ticketStore = new KKV(ticketId, (evt) => Storage.emitEvent(evt) );
    }

    return Storage.ticketStore;
  }
}

export default Storage;
