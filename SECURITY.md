# Security

Report vulnerabilities privately using GitHub's **Report a vulnerability** form:
<https://github.com/lumina-core/lumina-frontend/security/advisories/new>.
If that form is unavailable, email <lumina_dev@163.com> with a short description
and a safe reproduction. Do not open a public issue containing account data,
JWTs, internal keys, private conversation text or working share tokens.

Include the affected commit, route, expected/observed behavior and a minimal
synthetic example. There is no guaranteed response time or bug-bounty program.
Security fixes target the current main branch; older snapshots are unsupported.

The public repository contains the frontend, BFF and Agent orchestration, not
the private account/data service. Do not publish that service, its databases or
credentials to reproduce a report. `pnpm verify:local` checks isolated frontend
boundaries; the maintainer-only cross-service check is documented in README.
Neither fixture tests nor noindex are substitutes for real authorization.
