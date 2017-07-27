import PropTypes from 'prop-types';
import Rx from 'rxjs';
import R from 'ramda';
import 'whatwg-fetch';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

// TODO: externalize URLs

const Pendo = {

  // initialize (token) {
  //   // TODO: implement this to partially apply token once to all the functions here
  //   R.map((key) => R.partial(Pendo[key], token), ()R.filter(R.equals('initialize'),R.keys(Pendo)))
  // },

  fetchUserById (token, email) {
    return Rx.Observable.create((observer) => {
      fetch(`https://pendo-dev.appspot.com/api/v1/visitor/${email}`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key':token}
      })
        .then( checkStatus )
        .then( res => res.json() )
        .then( j => {
          observer.next(j);
          observer.complete();
        })
        .catch( err => observer.error(err) )
    });
  },

  findUsersByField (token, field, email) {
    return Rx.Observable.create((observer) => {
      fetch(`https://pendo-dev.appspot.com/api/v1/visitor/metadata/${field}/${email}`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key':token}
      })
        .then( checkStatus )
        .then( res => res.json() )
        .then( users => {
          users.map( (user) => observer.next(user) )
          // observer.next(j);
          observer.complete();
        })
        .catch( err => observer.error(err) )
    });
  },

  findAccountStream (token, accountId) {
    return Rx.Observable.create((observer) => {
      fetch(`https://pendo-dev.appspot.com/api/v1/account/${accountId}`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key':token}
      })
        .then( checkStatus )
        .then( res => res.json() )
        .then( j => {
          observer.next(j);
          observer.complete();
        })
        .catch( err => observer.error(err) )
    });
  },

  runAggregation (token, agg) {
    return Rx.Observable.create((observer) => {
      fetch(`https://pendo-dev.appspot.com/api/v1/aggregation`, {
        method: 'POST',
        headers: {
          'X-Pendo-Integration-Key':token,
          'content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(agg)
      })
        .then( checkStatus )
        .then( res => res.json() )
        .then( obj => {
          obj.results.map( (r) => observer.next(r) );
          observer.complete();
        })
        .catch( err => observer.error(err) )
    });
  }
};

Pendo.fetchUserById.propTypes = {
  email: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired
};
Pendo.findAccountStream.propTypes = {
  accountId: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired
};
// TODO: add propTypes for:
// findUsersByField
// runAggregation

export default Pendo;
