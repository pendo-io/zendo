import PropTypes from 'prop-types';
import Rx from 'rxjs';
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

  findUserStream (email, token) {
    return Rx.Observable.create(function(observer) {
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

  findAccountStream (accountId, token) {
    return Rx.Observable.create(function(observer) {
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
  }
};

Pendo.findUserStream.propTypes = {
  email: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired
};
Pendo.findAccountStream.propTypes = {
  accountId: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired
};

export default Pendo;
