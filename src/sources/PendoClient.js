import PropTypes from 'prop-types';
import Rx from 'rxjs';
import 'whatwg-fetch';

const Pendo = {

  findUserStream (email, token) {
    return Rx.Observable.create(function(observer) {
      fetch(`https://pendo-dev.appspot.com/api/v1/visitor/brec@pendo.io`, {
        method: 'GET',
        headers: {'X-Pendo-Integration-Key':token}
      })
        .then( res => res.json() )
        .then(j => {
          observer.next(j);
          observer.complete();
        })
        .catch(observer.error)
    });
  },

  findAccountStream (accountId, token) {
    const url = `https://pendo-dev.appspot.com/api/v1/account/${accountId}`;
    const prom = fetch(url, {
      method: 'GET',
      headers: {'X-Pendo-Integration-Key':token}
    });
    return Rx.Observable.create(function(observer) {
      prom
        .then( res => res.json() )
        .then(j => {
          observer.next(j);
          observer.complete();
        })
        .catch(observer.error);
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
