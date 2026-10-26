# Deployment boundary

The current target uses fixed official Node 24.19.0 and systemd under a dedicated account. Release archives contain committed server/domain sources, the lockfile, notices, a built web bundle and a hashed release manifest. Install production dependencies with `pnpm install --prod --frozen-lockfile --ignore-scripts`.

`service.env.example` describes the current private SSH-forwarded origin. Production secrets are installed separately into a root-only environment file. The browser receives only a session cookie. `ccagent.service` binds the app to loopback; the local SSH tunnel also binds loopback. The Caddy unit is currently disabled because the temporary public hostname is blocked by the provider. Enable it only after a real permitted hostname, DNS, Origin and TLS have been configured and tested.

Before replacement, stop the app and create a coordinated backup. Install into `/opt/ccagent/releases/<source-sha>`, switch `/opt/ccagent/current` and restart only this app. `/health` returns the source SHA from the release manifest. Roll back the link separately from business data; never roll back privacy or model-budget ledgers. See the [runbook](../docs/operations/runbook.md) for recovery and exact current evidence.
