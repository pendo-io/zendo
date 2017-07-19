import Rx from 'rxjs';

const initZAF = () => {
  /* eslint-disable no-undef */
  const client = ZAFClient.init();

  if (!client) {
    throw new Error("Failed to initialized ZAFClient");
  }

  return client;
}

const resize = (client, width='100%', height='800px') => {
  client.invoke('resize', {
    width: width,
    height: height
  });
}

const zaf$ = new Rx.BehaviorSubject(initZAF());

zaf$.subscribe(resize, (e) => console.error(e) );


const ZAF = {

  getRequester() {
    return zaf$.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.get(['ticket.requester']))
    }).map( (data) => data['ticket.requester'] );
  },

  getEmail() {
    return ZAF.getRequester().map( (requester) => requester.email );
  },

  getMetadata() {
    return zaf$.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.metadata())
    });
  },

  // getContext() {
  //   return zafSubject.flatMap( (client) => {
  //     return Rx.Observable.fromPromise(client.context())
  //   });
  // },

  getApiToken () {
    return ZAF.getMetadata().map( (md) => md.settings.token );
  }

  // requestStream (options) {
  //   return startStream.flatMap( (client) => {
  //     return Rx.Observable.fromPromise( client.request(options) );
  //   });
  // }

};

export default ZAF;
