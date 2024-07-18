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
    return [parts[0], lc + key].join('/');
  }
}

const Pendo = {

  prod: process.env.REACT_APP_HOST_ENV === 'production',

  initialize(token) {
    Pendo.getToken = () => token;
  },

  getUrl(token) {
    token = token || Pendo.getToken();

    if (Pendo.prod === false) {
      const integrationKey = token.split('.')[0];
      return {
        url: `https://pendo-dev.appspot.com`,
        integrationKey
      };
    }
    const [integrationKey, suffix] = token.split('.');
    if (typeof suffix === 'undefined' || suffix === 'us') {
      return {
        url: 'https://app.pendo.io',
        integrationKey
      };
    }
    return {
      url: `https://app.${suffix}.pendo.io`,
      integrationKey
    };
  },

  fetchUserById(token, email) {
    const { url, integrationKey } = this.getUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${url}/api/v1/visitor/${email}`, {
        method: 'GET',
        headers: { 'X-Pendo-Integration-Key': integrationKey }
      })
        .then(checkStatus)
        .then(res => res.json())
        .then(j => {
          observer.next(j);
          observer.complete();
        })
        .catch(err => observer.error(err))
    });
  },

  findUsersByField(token, field, email) {
    const { url, integrationKey } = this.getUrl(token);
    field = toLowerify(field);
    return Rx.Observable.create((observer) => {
      fetch(`${url}/api/v1/visitor/metadata/${field}/${email}`, {
        method: 'GET',
        headers: { 'X-Pendo-Integration-Key': integrationKey }
      })
        .then(checkStatus)
        .then(res => res.json())
        .then(users => {
          if (!users || users.length === 0)
            throw new Error('No Users Found');
          users.map((user) => observer.next(user))
          observer.complete();
        })
        .catch(err => observer.error(err))
    });
  },

  findAccountStream(token, accountId) {
    const { url, integrationKey } = this.getUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${url}/api/v1/account/${accountId}`, {
        method: 'GET',
        headers: { 'X-Pendo-Integration-Key': integrationKey }
      })
        .then(checkStatus)
        .then(res => res.json())
        .then(j => {
          observer.next(j);
          observer.complete();
        })
        .catch(err => observer.error(err))
    });
  },

  runAggregation(token, agg) {
    const { url, integrationKey } = this.getUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${url}/api/v1/aggregation`, {
        method: 'POST',
        headers: {
          'X-Pendo-Integration-Key': integrationKey,
          'content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(agg)
      })
        .then(checkStatus)
        .then(res => res.json())
        .then(obj => {
          obj.results.map((r) => observer.next(r));
          observer.complete();
        })
        .catch(err => observer.error(err))
    });
  },

  getMetadataSchema(token, type) {
    const { url, integrationKey } = this.getUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${url}/api/v1/metadata/schema/${type}`, {
        method: 'GET',
        headers: { 'X-Pendo-Integration-Key': integrationKey }
      })
        .then(checkStatus)
        .then(res => res.json())
        .then(obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch(err => observer.error(err))
    });
  },

  getVisitorHistory(token, visitorId, endDate) {
    const { url, integrationKey } = this.getUrl(token);
    endDate.setHours(0); endDate.setMinutes(0); endDate.setSeconds(0); endDate.setMilliseconds(0);
    const starttime = endDate.getTime();
    return Rx.Observable.create((observer) => {
      fetch(`${url}/api/v1/visitor/${visitorId}/history?starttime=${starttime}`, {
        method: 'GET',
        headers: { 'X-Pendo-Integration-Key': integrationKey }
      })
        .then(checkStatus)
        .then(res => res.json())
        .then(obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch(err => observer.error(err))
    });
  },

  getPages(token) {
    const { url, integrationKey } = this.getUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${url}/api/v1/page?expand=*`, {
        method: 'GET',
        headers: { 'X-Pendo-Integration-Key': integrationKey }
      })
        .then(checkStatus)
        .then(res => res.json())
        .then(obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch(err => observer.error(err))
    })
  },

  getFeatures(token) {
    const { url, integrationKey } = this.getUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${url}/api/v1/feature?expand=*`, {
        method: 'GET',
        headers: { 'X-Pendo-Integration-Key': integrationKey }
      })
        .then(checkStatus)
        .then(res => res.json())
        .then(obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch(err => observer.error(err))
    })
  },

  getGuides(token, ids) {
    const { url, integrationKey } = this.getUrl(token);
    if (!ids.length) return Rx.Observable.of([]);

    return Rx.Observable.create((observer) => {
      fetch(`${url}/api/v1/guide?id=${ids.join(',')}`, {
        method: 'GET',
        headers: { 'X-Pendo-Integration-Key': integrationKey }
      })
        .then(checkStatus) // if one isn't found then whole request errors
        .then(res => res.json())
        .then(obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch(err => {
          // observer.error(err)
          observer.next([]);
          observer.complete();
        })
    })
  },

  getTrackTypes(token) {
    const { url, integrationKey } = this.getUrl(token);
    return Rx.Observable.create((observer) => {
      fetch(`${url}/api/v1/tracktype?expand=*`, {
        method: 'GET',
        headers: { 'X-Pendo-Integration-Key': integrationKey }
      })
        .then(checkStatus)
        .then(res => res.json())
        .then(obj => {
          observer.next(obj);
          observer.complete();
        })
        .catch(err => observer.error(err))
    });
  },

  getItemId(item) {
    return item.pageId || item.featureId || item.guideId || item.trackTypeId;
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

export default Pendo;
