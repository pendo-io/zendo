# Zendo

React based app running inside an iframe on the sidebar of zendesk customer support app.

For this project we'll need:

* npm create-react-app
* gem zendesk_apps_tools

Look here, https://developer.zendesk.com/apps/docs/developer-guide/zat for info on `zat`.

If you are running on a Macbook Pro M1 machine (or even later version), you may run into issues with the 
version of `nokogiri` that you are asked to install when installing `zat`. Running `gem install nokogiri -v 1.13.10`
will install the `x86_64-darwin` version of the package, but you will actually need the `arm64-darwin` version that
is compatible with M1 machines. To do this, before running `gem install nokogiri -v 1.13.10`, you should run
`bundle config set force_ruby_platform true`. If you already installed `nokogiri`, you can run `gem uninstall nokogiri`,
then run the `bundle` command before re-installing `nokogiri`.

## Build

`npm run build` for development builds
`npm run build:prod` for production builds

## Test Deploys

ZAT has a server mode that will let you run from local host. You can read about it in the above link.
The next best way to test a build is to use a private Zendesk app.

We have a developer account here https://d3v-pendo-platformhelp.zendesk.com/agent/dashboard.
You can get a free Zendesk account that is prefixed with a string like `d3v-` to indicate its a development account. It may be preferrable to use multiple
or to use a shared login as membership is limited for developer accounts.

### Local settings

[ZAT documentation](https://github.com/zendesk/zendesk_apps_tools/blob/e01fce5c5745b0a047b0ca02c76ea094c4026f62/doc/tools.md#app-settings)

On startup, The local ZAT server will interactively ask for the application
settings (see `parameters` in `zendesk-app/manifest.json`). If you create
a `settings.yml` file with the below **example** contents, the app will be
started with those settings:

```yml
token: "<PENDO_INTEGRATION_KEY"
pendo-lookup-field: "agent/email"
enable-user-lookup-field: true
```

## Testing

Nothing to see here (or do); move along.
