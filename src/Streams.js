import Rx from 'rxjs';
import R from 'ramda';
// import PropTypes from 'prop-types';

import ZAF from './sources/ZAFClient';
import Pendo from './sources/PendoClient';
import Storage from './sources/Storage';

import NumDaysRequest from './aggregations/NumDaysActiveForVisitors';

const Streams = {

  getVisitorStream: R.memoize(() => {
    const $ = new Rx.AsyncSubject();

    const obs = Rx.Observable.zip(
      ZAF.getEmail(),
      ZAF.getApiToken(),
      ZAF.getIDLookupField()
    ).flatMap( ([email, token, field]) => {
      return field === 'ID' || !field ?
        Pendo.fetchUserById(token, email) :
        Pendo.findUsersByField(token, field, email);
    })
    .take(1)
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

  getAccountStream: R.memoize(() => {
    const $ = new Rx.AsyncSubject();

    const obs = Rx.Observable.zip(
      ZAF.getApiToken(),
      Streams.getVisitorStream()
        .map((v) => v.accountIds[0])
    ).flatMap( ([token, acctId]) => Pendo.findAccountStream(token, acctId))
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

  getFilter (filterKey) {
    const defaults = filterKey === 'visitor-metadata-filter' ?
      ['language', 'role', 'firstvisit', 'lastvisit', 'lastservername'] :
      ['name', 'lastvisit'];

    return ZAF.getTicketId()
      .map( (ticketId) => Storage.getTicketStorage(ticketId).read(filterKey) )
      .map( (filter) => {
        const result = filter || defaults.map((key) => { return {key, isVisible:true} });

        if (!filter) {
          Storage.getTicketStorage().write(filterKey, result);
        }
        return result;
      })
  },

  watchTicketStorage (filterKey) {
    return ZAF.getTicketId()
      .combineLatest(Storage.fromEvent())
      .filter(([ticketId, evt]) => {
        // console.log("watchTicketStorage.filter: ", ticketId, evt.key);
        return evt.key === Storage.composeKey(ticketId, filterKey);
      })
      .map(([ticketId, evt]) => {
        // console.log("watchTicketStorage.map: ", ticketId, evt.newValue);
        return evt.newValue;
      })
      .distinctUntilChanged()
      .catch( err => Rx.Observable.of(err) );
  },

  getNumDaysActiveMetric: R.memoize(() => {
    const $ = new Rx.AsyncSubject();

    const obs = Rx.Observable.zip(
      ZAF.getApiToken(),
      Streams.getVisitorStream().map((v) => v.id)
    )
      .flatMap( ([token, visitorId]) => {
        const agg = NumDaysRequest(visitorId);
        return Pendo.runAggregation(token, agg);
      }).reduce((acc, val) => {
        if (!acc.title) {
          acc.title = "Days Active Last 30 Days";
          acc.value = val.daysActive
        } else
          acc.value += val.daysActive;
        return acc;
      }, {})
      .catch( err => Rx.Observable.of(err) )
      .subscribe(
        (n) => {
          $.next(n)
          obs.complete();
        },
        (e) => $.error(e),
        (c) => $.complete(c)
      );

      return $;
  })
};

export default Streams;
