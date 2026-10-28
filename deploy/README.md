# Deployment boundary

The current target uses fixed official Node 24.19.0 and systemd under a dedicated account. Release archives contain committed server/domain sources, the lockfile, notices, a built web bundle and a hashed release manifest. Install production dependencies with `pnpm install --prod --frozen-lockfile --ignore-scripts`.

All IP addresses and directories in these files are examples. Replace them consistently for your own installation and verify platform access rules, Origin and TLS before exposing the service. Install production secrets separately into a root-only environment file. The browser receives only a session cookie. `ccagent.service` binds the app to loopback; Caddy provides the public HTTPS entry. These example files do not describe or modify the original maintainer's production installation.

Before replacement, stop the app and create a coordinated backup. Install into `/srv/cc-workbench/app/releases/<source-sha>`, switch `/srv/cc-workbench/app/current` and restart only this app. `/health` returns the source SHA from the release manifest. Roll back the link separately from business data; never roll back privacy or model-budget ledgers. See the [runbook](../docs/operations/runbook.md) for recovery and exact current evidence.
