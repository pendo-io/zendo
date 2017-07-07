import Rx from 'rxjs';
// import PropTypes from 'prop-types';

import ZAF from './sources/ZAFClient';
import Pendo from './sources/PendoClient';
// import Storage from './sources/Storage';

var vSub = null;
var aSub = null;

const Streams = {

  getVisitorStream () {
    if (vSub) return vSub;

    vSub = new Rx.Subject();

    const EmailStream = ZAF.getEmail();
    const TokenStream = ZAF.getApiToken();
    EmailStream.combineLatest(TokenStream, (email, token) => [email,token] )
      .flatMap( ([email, token]) => Pendo.findUserStream(email, token) )
      .catch( (err) => Rx.Observable.of(err) )
      .subscribe(vSub);

    return vSub;
  },

  getAccountStream () {
    if (aSub) return aSub;

    aSub = new Rx.Subject();

    const VisitorStream = Streams.getVisitorStream();
    const TokenStream = ZAF.getApiToken();
    VisitorStream.combineLatest(TokenStream, (visitor, token) => [visitor, token] )
      .flatMap( ([visitor, token]) => {
        if (!visitor || !visitor.accountIds.length)
          return Rx.Observable.empty();

        return Pendo.findAccountStream( visitor.accountIds[0], token );
      })
      .catch( err => Rx.Observable.of(err) )
      .subscribe(aSub);

    return aSub;
  },

  getAvatarUrlStream () {
    return ZAF.getRequester().map( (reqstr) => reqstr.avatarUrl );
  },

  // TODO: implement real stream of filter data from some storage somewhere
  getVisitorMetadataFilter () {
    // return Storage.get('VisitorMetadataFilter').map((key) => { return {key} });
    return Rx.Observable.of(['language', 'role', 'firstvisit', 'lastvisit', 'lastservername'].map((key) => { return {key} }));
  },

  getAccountMetadataFilter () {
    return Rx.Observable.of(['name', 'lastvisit'].map((key) => { return {key} }));
  }

};

export default Streams;
