import Rx from 'rxjs';

const startStream = Rx.Observable.create( (observer) => {

  /* eslint-disable no-undef */
  const client = ZAFClient.init();

  if (!client) {
    observer.error("Failed to initialized ZAFClient");
    observer.complete();
  }

  client.invoke('resize', {
    width: '100%',
    height: '400px'
  });

  observer.next(client);
  observer.complete();
});

const ZAF = {

  getEmail() {
    return ZAF.getRequester().map( (requester) => requester.email );
  },

  getRequester() {
    return startStream.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.get(['ticket.requester']))
    }).map( (data) => data['ticket.requester'] );
  },

  getMetadata() {
    return startStream.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.metadata())
    });
  },

  getContext() {
    return startStream.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.context())
    });
  },

  getApiToken () {
    // return Rx.Observable.fromPromise(ZAF.getMetadata())
    //   .reduce( (md) => md.settings.token );
    return ZAF.getMetadata().map( (md) => md.settings.token );
  },

  // requestStream (options) {
  //   return startStream.flatMap( (client) => {
  //     return Rx.Observable.fromPromise( client.request(options) );
  //   });
  // }

};

export default ZAF;
