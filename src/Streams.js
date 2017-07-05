import Rx from 'rxjs';
import PropTypes from 'prop-types';

import ZAF from './sources/ZAFClient';
import Pendo from './sources/PendoClient';

const Streams = {

  getVisitorStream () {
    const EmailStream = ZAF.getEmail();
    const TokenStream = ZAF.getApiToken();
    return EmailStream.combineLatest(TokenStream, (email, token) => [email,token] )
      .flatMap( ([email, token]) => Pendo.findUserStream(email, token) );
  },

  getAccountStream () {
    const VisitorStream = Streams.getVisitorStream();
    const TokenStream = ZAF.getApiToken();
    return VisitorStream.combineLatest(TokenStream, (visitor, token) => [visitor, token] )
      .map( ([visitor, token]) => {
      // XXX fix this assumption that there will be an account id for the visitor
      return Pendo.findAccountStream( visitor.accountIds[0], token );
    });
  },

  getAvatarUrlStream () {
    return ZAF.getRequester().map( (reqstr) => reqstr.avatarUrl );
  }

};

export default Streams;
