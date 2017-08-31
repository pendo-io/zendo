import Rx from 'rxjs';
import Store from '../vendor/es6-store.js';

class MemStore {

  constructor () {
    this.map = {};
  }

  get(key) {
    return this.map[key];
  }

  set(key, value) {
    this.map[key] = value;
  }
}

class KKV {
  constructor(shardKey, onChange) {
    this.shardKey = shardKey;
    if (this.isAvailable()) {
      this.store = new Store(shardKey);
    } else {
      this.store = new MemStore(); // TODO -- Test
    }
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

  isAvailable () {
    let test = 'test';
    try {
       localStorage.setItem(test, test);
       localStorage.removeItem(test);
       return true;
    } catch(e) {
       return false;
    }
  }
}

const Storage = {
  ticketStore: null,
  commonStore: null,

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

  getCommonStorage () {
    if (!Storage.commonStore) {
      Storage.commonStore = new KKV('common', (evt) => Storage.emitEvent(evt) );
    }

    return Storage.commonStore;
  },

  getTicketStorage (ticketId) {
    if (!!ticketId) {
      Storage.ticketStore = new KKV(ticketId, (evt) => Storage.emitEvent(evt) );
    }

    return Storage.ticketStore;
  },
}

export default Storage;
