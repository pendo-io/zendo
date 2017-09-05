import React from 'react';
import recycle from 'recycle';
import R from 'ramda';
import factory from '../containers/SectionFactory';
import Streams from '../Streams';

const AccountMD = factory(
  'Account',
  Streams.getMetadata('account'),
  Streams.getMetadataFilter('account-metadata-filter'),
  Streams.getAccountMetrics()
);

const AccountSection = recycle({
  initialState: {
    accounts: []
  },

  update (sources) {
    return [
      Streams.getVisitorStream()
        .map( v => v.accountIds )
        .reducer( (state, accountIds) => {

          if (R.is(Error, accountIds)) {
            console.log("Got error", accountIds)
            return state;
          }

          state.accounts = accountIds;
          return state;
        })
    ];
  },
  view (props, state) {
    return (
      <div>
      {!!state.accounts && !!state.accounts.length &&
        <AccountMD />
      }
      </div>
    );
  }
});

export default AccountSection;
