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

/*
* Takes a Pendo metadata fieldname like `agent/email` and modifies to force
* it to be evaluated in the lower case.
*/
const toLowerify = (mdFieldName) => {
  const lc = '_lc_';
  const parts = mdFieldName.split('/');

  if (parts.length !== 2) {
    throw new Error("invalid metadata field");
  }

  const key = parts[1];
  if (R.startsWith(lc, key)) {
    return mdFieldName;
  } else {
    return [parts[0], lc+key].join('/');
  }
}

var Pendo = {

  url: process.env.REACT_APP_HOST_ENV === 'production' ? '' : 'https://pendo-dev.appspot.com',

  initialize (token) {
  //   // TODO: implement this to partially apply token once to all the functions here
    // R.map((key) => R.partial(Pendo[key], token), ()R.filter(R.equals('initialize'),R.keys(Pendo)))
    // R.map((key) => console.log(`applying ${token} to Pendo.${key}`), R.reject(R.equals('initialize'),R.keys(Pendo)))
    // R.map((key) => R.partial(Pendo[key], token), R.reject(R.equals('initialize'),R.keys(Pendo)))
  },

  setUrl (token) {
    if (Pendo.url === 'https://pendo-dev.appspot.com'){
      return; //this is a dev env, don't change
    }
    var subIndex = token.lastIndexOf('.');
    if (subIndex === -1) {
      Pendo.url = 'https://app.pendo.io'; //default to us site
    } else {
      Pendo.url = `https://app.${token.substring(subIndex + 1)}.pendo.io`; // use integration key domain if present
    }
  },

  fetchUserById (token, email) {
    this.setUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${Pendo.url}/api/v1/visitor/${email}`, {
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
    this.setUrl(token);
    field = toLowerify(field);
    return Rx.Observable.create((observer) => {
      fetch(`${Pendo.url}/api/v1/visitor/metadata/${field}/${email}`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key':token}
      })
        .then( checkStatus )
        .then( res => res.json() )
        .then( users => {
          if (!users || users.length === 0)
            throw new Error('No Users Found');
          users.map( (user) => observer.next(user) )
          observer.complete();
        })
        .catch( err => observer.error(err) )
    });
  },

  findAccountStream (token, accountId) {
    this.setUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${Pendo.url}/api/v1/account/${accountId}`, {
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
    this.setUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${Pendo.url}/api/v1/aggregation`, {
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
  },

  getMetadataSchema (token, type) {
    this.setUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${Pendo.url}/api/v1/metadata/schema/${type}`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key': token}
      })
        .then( checkStatus )
        .then( res => res.json() )
        .then( obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch( err => observer.error(err) )
    });
  },

  getVisitorHistory(token, visitorId, endDate) {
    this.setUrl(token);
    endDate.setHours(0); endDate.setMinutes(0); endDate.setSeconds(0); endDate.setMilliseconds(0);
    const starttime = endDate.getTime();
    return Rx.Observable.create((observer) => {
      fetch(`${Pendo.url}/api/v1/visitor/${visitorId}/history?starttime=${starttime}`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key': token}
      })
        .then( checkStatus )
        .then( res => res.json() )
        .then( obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch( err => observer.error(err) )
    });
  },

  getPages(token) {
    this.setUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${Pendo.url}/api/v1/page`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key': token}
      })
        .then( checkStatus )
        .then( res => res.json() )
        .then( obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch( err => observer.error(err) )
    })
  },

  getFeatures(token) {
    this.setUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${Pendo.url}/api/v1/feature`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key': token}
      })
        .then( checkStatus )
        .then( res => res.json() )
        .then( obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch( err => observer.error(err) )
    })
  },

  getGuides(token, ids) {
    this.setUrl(token);
    if (!ids.length) return Rx.Observable.of([]);

    return Rx.Observable.create((observer) => {
      fetch(`${Pendo.url}/api/v1/guide?id=${ids.join(',')}`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key': token}
      })
        .then( checkStatus ) // if one isn't found then whole request errors
        .then( res => res.json() )
        .then( obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch( err => {
          // observer.error(err)
          observer.next([]);
          observer.complete();
        })
    })
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
