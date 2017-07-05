import PropTypes from 'prop-types';
import Rx from 'rxjs';
import 'whatwg-fetch';

import ZAF from './ZAFClient';

var cachedVisitor = null;

const Pendo = {

  findUserStream (email, token) {
    // const reqObj = {
    //   url: `https://pendo-dev.appspot.com/api/v1/visitor/brec@pendo.io`,//${email}`,
    //   headers: {
    //     'X-Pendo-Integration-Key':"{{setting.token}}"
    //   },
    //   type: 'GET',
    //   secure: true,
    //   dataType: 'json'
    // };

    // return Rx.Observable.fromPromise( ZAF.requestStream(reqObj) );

    let stream = Rx.Observable.create(function(observer) {
      if (cachedVisitor) {
        observer.next(Promise.when(cachedVisitor));
        observer.complete();
        return;
      }

      fetch(`https://pendo-dev.appspot.com/api/v1/visitor/brec@pendo.io`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key':token}
      })
        .then( res => res.json() )
        .then(j => {
          cachedVisitor = j;
          observer.next(j);
          observer.complete();
        })
        .catch(observer.error)
    })

    return stream;
  },

  findAccountStream (accountId, token) {
    // const reqObj = {
    //   url: `pendo-dev.appspot.com/api/v1/account/${accountId}`,
    //   headers: {
    //     'X-Pendo-Integration-Key':"{{setting.token}}"
    //   },
    //   secure: true,
    //   contentType: 'application/json'
    // };
    //
    // return Rx.Observable.fromPromise( ZAF.requestStream(reqObj) );

    let stream = Rx.Observable.create(function(observer) {
      fetch(`https://pendo-dev.appspot.com/api/v1/account/${accountId}`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key':token}
      })
        .then( res => res.json() )
        .then(j => {
          observer.next(j);
          observer.complete();
        })
        .catch(observer.error)
    })

    return stream;
  }

};

Pendo.findUserStream.propTypes = {
  email: PropTypes.string.isRequired
};
// Pendo.findAccountStream.propTypes = {
//   accountId: PropTypes.string.isRequired
// };

export default Pendo;
