import Rx from 'rxjs';
import R from 'ramda';
import Pendo from './PendoClient';
import Storage from './Storage';

const initZAF = R.memoize(() => {
  /* eslint-disable no-undef */
  const client = ZAFClient.init();

  if (!client) {
    throw new Error("Failed to initialized ZAFClient");
  }

  return client;
});

const resize = (client, width='100%', height='800px') => {
  client.invoke('resize', {
    width: width,
    height: height
  });
}

const initStorage = (ticketId) => {
  Storage.getTicketStorage(ticketId);
}

const zaf$ = new Rx.BehaviorSubject(initZAF());

const ZAF = {
  getCurrentUser () {
    return zaf$.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.get('currentUser'));
    }).map( (data) => {
      return data['currentUser'];
    })
  },

  getCurrentAccount () {
    return zaf$.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.get('currentAccount'))
    }).map( (data) => data['currentAccount'] )
  },

  getRequester () {
    return zaf$.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.get(['ticket.requester']))
    }).map( (data) => data['ticket.requester'] );
  },

  getTicket () {
    return zaf$.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.get(['ticket']))
    }).map( (data) => data['ticket'] )
  },

  getTicketCreateDate() {
    return ZAF.getTicket()
      .map( (ticket) => ticket.createdAt )
      .map( (dateStr) => new Date(dateStr) ) //new Date(1501689260706) ) //dateStr) ) // XXX put this back!
  },

  getEmail () {
    return ZAF.getRequester().map( (requester) => requester.email || requester.name );
  },

  getMetadata () {
    return zaf$.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.metadata())
    });
  },

  getContext () {
    return zaf$.flatMap( (client) => {
      return Rx.Observable.fromPromise(client.context())
    });
  },

  getTicketId () {
    return ZAF.getContext().map( (ctx) => ctx.ticketId );
  },

  getApiToken () {
    return ZAF.getMetadata().map( (md) => md.settings.token );
  },

  getIDLookupField () {
    return ZAF.getMetadata().map( ({settings}) => {
      return settings['enable-user-lookup-field'] ? settings['pendo-lookup-field'] : 'ID';
    });
  }
};


zaf$.subscribe(resize, (e) => console.error(e) );
ZAF.getTicketId()
  .subscribe(initStorage, console.error);

ZAF.getApiToken().subscribe(Pendo.initialize);


export default ZAF;
