# Search and traffic

Production origin: https://lumina-news-agent.vercel.app
Analytics: https://vercel.com/shanes-projects-025e82ba/lumina-news-agent/analytics
Search Console URL-prefix: https://lumina-news-agent.vercel.app/
Sitemap: https://lumina-news-agent.vercel.app/sitemap.xml

## Public-page implementation

`/` is a public, server-rendered Chinese and English product homepage, including when authentication is pending, fails or succeeds. Both languages share one canonical URL; there are no locale routes, query locales or hreflang variants. The English introduction does not imply an English chat interface. `/`, `/pricing` and `/privacy` are the only indexable pages, sitemap entries and allowed analytics paths. They share the exact allowlist in `lib/site.ts`; the sitemap has no invented last-modified dates.

`/chat`, concrete conversations, history, settings and cards still require login. Authentication and bearer share pages remain anonymous-accessible but noindex. Private pages, authentication, share links and API responses retain noindex headers; the global metadata defaults to noindex/nofollow. Home-specific canonical and social metadata do not propagate into private routes. Robots permits crawling to read noindex directives; it is not an access-control mechanism. Existing bearer share links continue to work for anyone holding the link.

`components/PrivacyAnalytics.tsx` and `lib/analytics-policy.ts` permit pageviews only on those three exact paths and only on the HTTPS production origin. DNT or GPC disables collection. Query strings and fragments are stripped; custom events, URL credentials, private/dynamic paths and non-production origins are rejected. Questions, answers, email addresses, conversation IDs and share tokens are not event data. The privacy page separately explains account data, persisted conversations and token-based credit billing.

The official SDK remains pinned to `@vercel/analytics` 2.0.1. No GA/GTM, paid upgrade or fabricated pageviews are introduced. A read-only Vercel project check on 2026-10-10 confirmed the analytics switch is enabled and the production branch is `main`; no project settings were changed. Historical traffic before activation cannot be reconstructed. Google verification remains in `app/layout.tsx` and must be retained.

The existing old-host rule redirects `lumina-puce-one.vercel.app` pages with HTTP 308, preserving path and query. API compatibility stays on the old host to avoid cross-origin credential loss. Sessions are host-only, so old bookmarks may require logging in on the primary host. This implementation does not change redirects, accounts or backend services.

## Local verification and future release

Local verification on 2026-10-10: 9/9 node tests and 17/17 browser tests passed (both installed Chrome and Playwright's cached pinned Chromium). Lint, TypeScript, production build and `git diff --check` passed. Desktop and 320px screenshots were inspected. These are worktree results, not remote CI or production verification.

The test suite covers the exact allowlist, rendered bilingual copy, canonical/robots metadata, public navigation and analytics redaction. Playwright runs against a loopback production build with explicit browser fixtures for anonymous, delayed, failed and signed-in auth, plus a bearer-share fixture. It checks no-JS SSR, hydration, private redirects, noindex headers, 320px overflow, touch targets and keyboard navigation. Fixtures exercise UI boundaries, not live authentication, billing or model quality. See the [README](../README.md) for isolated local commands.

CI is configured to install locked dependencies, run unit tests, lint, build, type-check and execute Chromium browser tests on PRs without secrets. Remote CI and deployments must be checked independently in GitHub and Vercel. A homepage release does not establish Google indexing or visitor growth; no new manual Google submission is implied by this change.

After an intentionally authorized merge/deployment:

1. Check CI and Vercel deployment readiness independently; CI success alone does not prove deployment success.
2. On the primary domain, verify `/` is HTTP 200 with bilingual content before and after hydration; verify `/pricing` and `/privacy`. Confirm login is still required on every private route and that share/auth pages remain noindex.
3. Inspect canonical, robots, social metadata and the preserved Google tag. Fetch XML sitemap with exactly the three canonical public URLs, and confirm robots allows Google to read noindex pages.
4. Check the official analytics script response and configuration, production-origin restriction, DNT/GPC opt-out, and sanitized public-only pageviews. Do not fabricate visits or treat test traffic as organic use.
5. In Search Console, inspect the updated sitemap and run Google's live URL tests. Record ownership, fetchability, sitemap processing and actual indexing separately. Recheck after Google processes changes; do not infer indexing or growth from sitemap Success.

## HISTORICAL: Search Console observations from 2026-10-09

These observations describe the earlier deployed site, whose homepage redirected to `/chat`. They are retained as history, not a new verification of this branch.

On 2026-10-09 ownership was verified via the HTML tag and the sitemap report showed **Success**. Its discovered-page count still showed three previous URLs while that deployment's corrected sitemap contained only `/pricing` and `/privacy`; it had been resubmitted after the correction.

Google live tests at 22:02 and 22:03 (Asia/Shanghai) reported that `/pricing` and `/privacy` were available to Google and could be indexed. Their index reports said **Discovered - currently not indexed** and referenced the sitemap. No manual actions or security issues were detected then. A manual indexing request for `/pricing` was rejected with **Quota Exceeded**, was not accepted and was not retried.

A rendered live test showed anonymous `/chat` redirecting to the noindex login page, which is why it stayed excluded. No current Search Console or indexing claims are made here. Ownership verification, sitemap Success and fetchability are not indexing, visitors or growth. See [Google's sitemap guidance](https://support.google.com/webmasters/answer/7451001?hl=en).
