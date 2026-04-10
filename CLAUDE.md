# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Zendo is a React app that runs inside a Zendesk ticket sidebar iframe. It uses the Zendesk Apps Framework (ZAF) to read ticket/requester data and the Pendo Integration API to display visitor/account analytics to support agents.

## Commands

```bash
npm start              # Dev server (rarely useful — requires ZAF context)
npm run build          # Development build → copies output to zendesk-app/assets/
npm run build:prod     # Production build (sets REACT_APP_HOST_ENV=production)
npm run package        # Full release: clean → build:prod → strip source maps → zat package
npm test               # Run tests with react-scripts (jest)
```

To run a single test file:
```bash
npm test -- --testPathPattern=App.test
```

ZAT (Zendesk Apps Tools) is a Ruby gem required for packaging and local serving. Install with `gem install zendesk_apps_tools`. On Apple Silicon, run `bundle config set force_ruby_platform true` before installing nokogiri.

Local ZAT server settings go in `zendesk-app/settings.yml` (gitignored):
```yml
apiKey: "<PENDO_INTEGRATION_KEY>"       # integration key UUID only, no suffix
pendo-host: "app.pendo.io"             # API host for your target env
pendo-lookup-field: "agent/email"
enable-user-lookup-field: true
```

**Note:** `apiKey` is a secure setting. `zat server` + `?zat=true` will NOT work for
testing — Zendesk's secure proxy returns `InstallationNotFound` because ZAT has no real
installation record. See [Testing locally](#testing-locally) below.

## Architecture

### Data Flow

All data flows through RxJS 5 observables. `src/Streams.js` is the central hub — it wires together ZAF and Pendo data sources into memoized observable streams consumed by React containers.

**Sources:**
- `src/sources/ZAFClient.js` — wraps the global `ZAFClient` (injected by Zendesk) as RxJS observables. On load it also resizes the iframe and initializes per-ticket storage.
- `src/sources/PendoClient.js` — wraps Pendo REST API calls as RxJS observables. All requests go through ZAF's `client.request()` with `secure: true`, so the API key is substituted server-side and never exposed in the browser. The target host comes from the `pendo-host` app setting (e.g. `app.pendo.io`, `app.eu.pendo.io`, `app.pendo-dev.pendo-dev.com`).
- `src/sources/Storage.js` — localStorage wrapper providing per-ticket storage and a common storage namespace, with change events as observables.

**Aggregations** (`src/aggregations/`): Functions that construct Pendo aggregation pipeline request bodies (passed to `PendoClient.runAggregation`).

**Containers** use `recycle` (a reactive React component library over RxJS) rather than Redux. `SectionFactory.js` is a factory that produces `recycle` components for displaying visitor or account metadata sections.

### Visitor Lookup Strategy

The app supports two modes for finding the Pendo visitor matching the Zendesk ticket requester:
1. **By ID** (default): Uses the requester's email as the Pendo visitor ID.
2. **By metadata field**: Looks up via a Pendo metadata field like `agent/email`. Controlled by the `enable-user-lookup-field` and `pendo-lookup-field` app settings in `zendesk-app/manifest.json`.

### Zendesk App Config

`zendesk-app/manifest.json` defines the app parameters. Key settings:

| Setting | Secure | Required | Description |
|---|---|---|---|
| `apiKey` | ✓ | ✓ | Pendo integration key (UUID only, no suffix) |
| `pendo-host` | — | ✓ | Pendo API host (e.g. `app.pendo.io`, `app.eu.pendo.io`) |
| `pendo-lookup-field` | — | — | Metadata field for visitor lookup (e.g. `visitor/email`) |
| `enable-user-lookup-field` | — | — | Toggle metadata-field lookup vs. lookup by ID |

The built React app is served from `zendesk-app/assets/index.html` inside the Zendesk ticket sidebar.

### Testing Locally

Because `apiKey` uses ZAF secure settings, Zendesk's proxy must resolve the `{{setting.apiKey}}` placeholder server-side. `zat server` alone cannot do this — requests return `422 InstallationNotFound`.

**The only way to fully test is to install the app as a private app:**

1. Build and package:
   ```bash
   npm run package
   ```
   This produces `zendesk-app/tmp/pendo-*.zip`.

2. In your Zendesk dev instance, go to **Admin → Apps and integrations → Zendesk Support apps → Upload private app** and upload the zip.

3. During installation, configure:
   - **apiKey** — your Pendo integration key (UUID only)
   - **pendo-host** — the Pendo API host for your env (e.g. `app.pendo-dev.pendo-dev.com` for dev/link envs)

4. Open a ticket **without** `?zat=true` in the URL. The installed app loads and API calls go through the secure proxy successfully.

> If you previously had the Pendo app installed, disable it first — otherwise the two installations conflict.
