import R from 'ramda';
import ZAF from './sources/ZAFClient';

const appKey = '8643e4cf-c97f-42ae-67b4-c1263e01c97b';
const doInstall = (apiKey, userObj, accountObj) => {
  (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=[];
    v=['initialize','identify','updateOptions','pageLoad'];for(w=0,x=v.length;w<x;++w)(function(m){
    o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
    y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
    z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');

  // Call this whenever information about your visitors becomes available
  // Please use Strings, Numbers, or Bools for value types.

  console.log(apiKey, userObj, accountObj);

  /* eslint-disable no-undef */
  pendo.initialize({
    visitor: userObj,
    account: accountObj
  });
}

ZAF.getCurrentUser()
  .combineLatest(
    ZAF.getCurrentAccount(),
      (user, acct) => {
        // get user.organizations[0] and merge with account
        let org = user.organizations[0]; // is this safe?
        acct = R.merge(acct, org);

        // then

        // from user - omit organizations, groups, tags, and timeZone
        user = R.omit(['organizations','groups', 'tags', 'timeZone'], user);

        // from account - omit organizationFields, and tags
        acct = R.omit(['organizationFields', 'tags', 'timeZone'], acct);

        return [user, acct];
      }
    )
  .subscribe( ([user, acct]) => {
    doInstall(appKey, user, acct);
  })

export default appKey;
