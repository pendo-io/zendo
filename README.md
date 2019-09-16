# Zendo

React based app running inside an iframe on the sidebar of zendesk customer support app.

For this project we'll need:

* npm create-react-app
* gem zendesk_apps_tools

Look here, https://developer.zendesk.com/apps/docs/developer-guide/zat for info on `zat`.

## Build

`npm run build` for development builds
`npm run build:prod` for production builds

## Test Deploys

ZAT has a server mode that will let you run from local host. You can read about it in the above link.
The next best way to test a build is to use a private Zendesk app.

We have a developer account here https://d3v-pendosupport.zendesk.com/agent/dashboard.
You can get a free Zendesk account that is prefixed with a string like `d3v-` to indicate its a development account. It may be preferrable to use multiple
or to use a shared login as membership is limited for developer accounts.

## Testing

Nothing to see here (or do); move along.
