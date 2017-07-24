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

  getContext() {
    return zaf$.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.context())
    });
  },

  getTicketId () {
    return ZAF.getContext().map( (ctx) => ctx.ticketId );
  },

  getApiToken () {
    return ZAF.getMetadata().map( (md) => md.settings.token );
  }
};

export default ZAF;
