import Rx from 'rxjs';
import R from 'ramda';
// import PropTypes from 'prop-types';

import ZAF from './sources/ZAFClient';
import Pendo from './sources/PendoClient';
import Storage from './sources/Storage';

// var vSub = null;
// var aSub = null;
// var vfilterSub = null;

const Streams = {

  getVisitorStream2: R.memoize(() => {
    const $ = new Rx.AsyncSubject;

    const obs = Rx.Observable.zip(
      ZAF.getEmail(),
      ZAF.getApiToken()
    ).flatMap( ([email, token]) => Pendo.findUserStream(email, token) )
    .subscribe(
      (n) => {
        $.next(n)
        obs.complete();
      },
      (e) => $.error(e),
      (c) => $.complete(c)
    );

    return $;
  }),

  getAccountStream2: R.memoize(() => {
    const $ = new Rx.AsyncSubject;

    const obs = Rx.Observable.zip(
      ZAF.getApiToken(),
      Streams.getVisitorStream2()
        .map((v) => v.accountIds[0])
    ).flatMap( ([token, acctId]) => Pendo.findAccountStream(acctId, token))
    .subscribe(
      (n) => {
        $.next(n)
        obs.complete();
      },
      (e) => $.error(e),
      (c) => $.complete(c)
    );

    return $;
  }),

  getAvatarUrlStream () {
    return ZAF.getRequester().map( (reqstr) => reqstr.avatarUrl );
  },

  getFilter (filterKey = 'visitor-metadata-filter') {
    const defaults = filterKey == 'visitor-metadata-filter' ?
      ['language', 'role', 'firstvisit', 'lastvisit', 'lastservername'] :
      ['name', 'lastvisit'];

    return ZAF.getTicketId()
      .map( (ticketId) => Storage.getTicketStorage(ticketId).read(filterKey) )
      .map( (filter) => {
        const result = filter || defaults.map((key) => { return {key} });

        if (!filter) {
          Storage.getTicketStorage().write(filterKey, result);
        }
        return result;
      })
  },

  watchTicketStorage(filterKey = 'visitor-metadata-filter') {
    return ZAF.getTicketId()
      .combineLatest(Storage.fromEvent())
      .filter(([ticketId, evt]) => evt.key == Storage.composeKey(ticketId, filterKey))
      .map(([ticketId, evt]) => evt.newValue)
      .distinctUntilChanged()
      .catch( err => Rx.Observable.of(err) );
  }
};

export default Streams;
