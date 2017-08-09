import Rx from 'rxjs';
import R from 'ramda';
// import PropTypes from 'prop-types';

import ZAF from './sources/ZAFClient';
import Pendo from './sources/PendoClient';
import Storage from './sources/Storage';

import {
  NumDaysRequest,
  NumFeaturesUsed,
  NumUsers
} from './aggregations';

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

  getMetadataSchema: R.memoize((type) => {
    const $ = new Rx.AsyncSubject();
    const obs = ZAF.getApiToken()
      .flatMap( (token) => Pendo.getMetadataSchema(token, type) )
      .subscribe(
        (n) => {
          $.next(n);
          obs.complete();
        },
        (e) => $.error(e),
        (c) => $.complete(c)
      );
    return $;
  }),

  getMetadata: R.memoize((type) => {
    const obs = type === 'visitor' ?
      Streams.getVisitorStream().map( visitor => visitor.metadata ) :
      Streams.getAccountStream().map( account => account.metadata );

      return Rx.Observable.zip(
        obs,
        Streams.getMetadataSchema(type)
      ).map(([md, schema]) => {

        // FFfuuuuuuuu -- this would've been so great but the structures don't align
        // const mdP = R.mergeDeepLeft(md, schema);

        // f-it, we're going to make them align
        const aMD = R.map((groupObj) => {
          return R.map((val) => { return {value: val}; }, groupObj);
        }, md);

        const mdP = R.mergeDeepLeft(aMD, schema);
        return mdP;
      });
  }),

  getAvatarUrlStream () {
    return ZAF.getRequester().map( (reqstr) => reqstr.avatarUrl );
  },

  getFilter (filterKey) {
    return Rx.Observable.of(
      Storage.getCommonStorage().read(filterKey)
    )
      .map( (filter) => {
        const result = filter || [];

        if (!filter) {
          Storage.getCommonStorage().write(filterKey, result);
        }

        return result;
      })

    // return ZAF.getTicketId()
    //   .map( (ticketId) => Storage.getTicketStorage(ticketId).read(filterKey) )
    //   .map( (filter) => {
    //     const result = filter || [];
    //
    //     if (!filter) {
    //       Storage.getTicketStorage().write(filterKey, result);
    //     }
    //     return result;
    //   })
  },

  watchStorage (key) {
    return Storage.fromEvent()
      // .map( evt => {console.log(evt); return evt; } )
      .filter( evt => R.contains(key, evt.key) )
      .map( evt => evt.newValue )
      .distinctUntilChanged()
      .catch( err => Rx.Observable.of(err) )
  },

  // watchTicketStorage (filterKey) {
  //   return ZAF.getTicketId()
  //     .combineLatest(Storage.fromEvent())
  //     .filter(([ticketId, evt]) => {
  //       // console.log("watchTicketStorage.filter: ", ticketId, evt.key);
  //       return evt.key === Storage.composeKey(ticketId, filterKey);
  //     })
  //     .map(([ticketId, evt]) => {
  //       // console.log("watchTicketStorage.map: ", ticketId, evt.newValue);
  //       return evt.newValue;
  //     })
  //     .distinctUntilChanged()
  //     .catch( err => Rx.Observable.of(err) );
  // },

  getAccountMetrics: R.memoize(() => {
    return Rx.Observable.merge(
      Streams.getNumUsers()
    );
  }),
  getNumUsers: R.memoize(() => {
    const $ = new Rx.AsyncSubject();
    const obs = Rx.Observable.zip(
      ZAF.getApiToken(),
      Streams.getAccountStream().map((a) => a.id)
    )
      .flatMap(([token, acctId]) => {
        const agg = NumUsers(acctId);
        return Pendo.runAggregation(token, agg);
      }).reduce((acc, val) => {
        if (!acc.title) {
          acc.title = "Unique Users Last 30 Days";
          acc.value = val.count;
        }
        return acc;
      }, {})
      .catch(err => Rx.Observable.of(err))
      .subscribe(
        (n) => {
          $.next(n);
          obs.complete();
        },
        (e) => $.error(e),
        (c) => $.complete(c)
      );

    return $;
  }),

  getVisitorMetrics: R.memoize(() => {
    return Rx.Observable.merge(
      Streams.getNumDaysActiveMetric(),
      Streams.getNumFeaturesUsed()
    );
  }),

  getNumFeaturesUsed: R.memoize(() => {
    const $ = new Rx.AsyncSubject();

    const obs = Rx.Observable.zip(
      ZAF.getApiToken(),
      Streams.getVisitorStream().map((v) => v.id)
    )
      .flatMap( ([token, visitorId]) => {
        const agg = NumFeaturesUsed(visitorId);
        return Pendo.runAggregation(token, agg);
      }).reduce((acc, val) => {
        const fName = val["Feature Name"];
        if (!acc.title) {
          acc.title = "Features Used Last 30 Days";
          acc.value = 1;
          acc[fName] = 1;
        } else {
          if (!acc[fName]) {
            acc[fName] = 1;
            acc.value += 1;
          } else {
            acc[fName] += 1;
          }
        }

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
  }),

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
  }),

  // TODO: allow for a different time to be specified

  getVisitorHistory: R.memoize(() => {
    const $ = new Rx.AsyncSubject();
    const obs = Rx.Observable.zip(
      ZAF.getApiToken(),
      Streams.getVisitorStream().map( (v) => v.id ),
      ZAF.getTicketCreateDate()
    )
      .flatMap( ([token, visitorId, cDate]) => {
        return Pendo.getVisitorHistory(token, visitorId, cDate.getTime());
      })
      .map(R.reverse)
      .catch( err => Rx.Observable.of(err) )
      .subscribe(
        (n) => {
          $.next(n);
          obs.complete();
        },
        (e) => $.error(e),
        (c) => $.complete(c)
      );
    return $;
  }),

  getPendoModels: R.memoize(() => {
    return ZAF.getApiToken()
      .flatMap((token) => {
        return Rx.Observable.zip(
          Streams.getVisitorHistory()
            .map( (history) => R.filter(R.propEq('type', 'guide'), history) )
            .map( (guides) => R.map(R.prop('guideId'), guides) )
            .flatMap( (guideIds) => Pendo.getGuides(token, guideIds) ),
          Pendo.getPages(token),
          Pendo.getFeatures(token)
        )
      })
  })
};

export default Streams;
