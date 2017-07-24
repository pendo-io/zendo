import Rx from 'rxjs';
import Store from '../vendor/es6-store.js';

class KKV {
  constructor(shardKey, onChange) {
    // this.subjectMap = {};
    this.shardKey = shardKey;
    this.store = new Store(shardKey);
    this.onChange = onChange;
  }

  // getSubjectForKey (key) {
  //   if (this.subjectMap[key]) return this.subjectMap[key];
  //   return this.subjectMap[key] = new Rx.BehaviorSubject();
  // }

  read (key) {
    return this.store.get(key);
    // const subject = this.getSubjectForKey(key);
    // try {
    // // return Rx.Observable.create( (observer) => {
    //   var result = this.store.get(key);
    //   subject.next(result);
    //   console.log(`read ${result} from ${key}`);
    // //   observer.next(result);
    // //   observer.complete();
    // } catch( e ) {
    //   console.log("error from storage read");
    //   subject.error(e)
    // } finally {
    //   return subject;
    // }
  }

  write (key, value) {
    this.store.set(key, value);
    this.onChange({
      key: Storage.composeKey(this.shardKey, key),
      newValue: value
    })
  }

  // write (key, value) {
  //   const subject = this.getSubjectForKey(key);
  //   this.store.set(key, value);
  //   subject.next(value);
  //   return subject;
  // }
}

const onStoreChange = (evt) => {
  Storage.$.next(evt);
}
const shardToStoreMap = {};
const Storage = {

  composeKey (...keyPieces) {
    return keyPieces.join(':');
  },

  fromEvent () {
    return Rx.Observable.create(Storage.$)
  },
  $: new Rx.Subject,

  getTicketStorage (ticketId) {
    if (!shardToStoreMap[ticketId])
      shardToStoreMap[ticketId] = new KKV(ticketId, Storage.$.next);

    return shardToStoreMap[ticketId];
  }
}

export default Storage;
