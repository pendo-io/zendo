import Rx from 'rxjs';
import R from 'ramda';

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

const secureHeaders = { 'X-Pendo-Integration-Key': '{{setting.apiKey}}' };

const Pendo = {

  getBaseUrl(host) {
    return `https://${host}`;
  },

  fetchUserById(client, host, email) {
    const baseUrl = Pendo.getBaseUrl(host);
    return Rx.Observable.fromPromise(
      client.request({
        url: `${baseUrl}/api/v1/visitor/${email}`,
        type: 'GET',
        headers: secureHeaders,
        secure: true
      })
    );
  },

  findUsersByField(client, host, field, email) {
    field = toLowerify(field);
    const baseUrl = Pendo.getBaseUrl(host);
    return Rx.Observable.create((observer) => {
      client.request({
        url: `${baseUrl}/api/v1/visitor/metadata/${field}/${email}`,
        type: 'GET',
        headers: secureHeaders,
        secure: true
      }).then(users => {
        if (!users || users.length === 0)
          throw new Error('No Users Found');
        users.map((user) => observer.next(user));
        observer.complete();
      }).catch(err => observer.error(err));
    });
  },

  findAccountStream(client, host, accountId) {
    const baseUrl = Pendo.getBaseUrl(host);
    return Rx.Observable.fromPromise(
      client.request({
        url: `${baseUrl}/api/v1/account/${accountId}`,
        type: 'GET',
        headers: secureHeaders,
        secure: true
      })
    );
  },

  runAggregation(client, host, agg) {
    const baseUrl = Pendo.getBaseUrl(host);
    return Rx.Observable.create((observer) => {
      client.request({
        url: `${baseUrl}/api/v1/aggregation`,
        type: 'POST',
        headers: {
          ...secureHeaders,
          'content-type': 'application/json;charset=utf-8'
        },
        contentType: 'application/json;charset=utf-8',
        data: JSON.stringify(agg),
        secure: true
      }).then(obj => {
        obj.results.map((r) => observer.next(r));
        observer.complete();
      }).catch(err => observer.error(err));
    });
  },

  getMetadataSchema(client, host, type) {
    const baseUrl = Pendo.getBaseUrl(host);
    return Rx.Observable.fromPromise(
      client.request({
        url: `${baseUrl}/api/v1/metadata/schema/${type}`,
        type: 'GET',
        headers: secureHeaders,
        secure: true
      })
    );
  },

  getVisitorHistory(client, host, visitorId, endDate) {
    const baseUrl = Pendo.getBaseUrl(host);
    endDate.setHours(0); endDate.setMinutes(0); endDate.setSeconds(0); endDate.setMilliseconds(0);
    const starttime = endDate.getTime();
    return Rx.Observable.fromPromise(
      client.request({
        url: `${baseUrl}/api/v1/visitor/${visitorId}/history?starttime=${starttime}`,
        type: 'GET',
        headers: secureHeaders,
        secure: true
      })
    );
  },

  getPages(client, host) {
    const baseUrl = Pendo.getBaseUrl(host);
    return Rx.Observable.fromPromise(
      client.request({
        url: `${baseUrl}/api/v1/page?expand=*`,
        type: 'GET',
        headers: secureHeaders,
        secure: true
      })
    );
  },

  getFeatures(client, host) {
    const baseUrl = Pendo.getBaseUrl(host);
    return Rx.Observable.fromPromise(
      client.request({
        url: `${baseUrl}/api/v1/feature?expand=*`,
        type: 'GET',
        headers: secureHeaders,
        secure: true
      })
    );
  },

  getGuides(client, host, ids) {
    const baseUrl = Pendo.getBaseUrl(host);
    if (!ids.length) return Rx.Observable.of([]);

    return Rx.Observable.create((observer) => {
      client.request({
        url: `${baseUrl}/api/v1/guide?id=${ids.join(',')}`,
        type: 'GET',
        headers: secureHeaders,
        secure: true
      }).then(obj => {
        observer.next(obj);
        observer.complete();
      }).catch(err => {
        observer.next([]);
        observer.complete();
      });
    });
  },

  getTrackTypes(client, host) {
    const baseUrl = Pendo.getBaseUrl(host);
    return Rx.Observable.fromPromise(
      client.request({
        url: `${baseUrl}/api/v1/tracktype?expand=*`,
        type: 'GET',
        headers: secureHeaders,
        secure: true
      })
    );
  },

  getItemId(item) {
    return item.pageId || item.featureId || item.guideId || item.trackTypeId;
  }
};

export default Pendo;
