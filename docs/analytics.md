# Search and traffic

Production: https://lumina-news-agent.vercel.app
Analytics: https://vercel.com/shanes-projects-025e82ba/lumina-news-agent/analytics
Search Console URL-prefix: https://lumina-news-agent.vercel.app/
Sitemap: https://lumina-news-agent.vercel.app/sitemap.xml

The homepage redirects to `/chat`. Only `/chat`, `/pricing`, and `/privacy` are indexable and included in the sitemap. Account, authentication, concrete conversations and bearer share links inherit noindex and have explicit noindex response headers. Robots allows crawlers to see those directives; it is not authentication.

`components/PrivacyAnalytics.tsx` and `lib/analytics-policy.ts` allow pageviews on those same three paths only, on the HTTPS production origin. DNT or GPC disables collection. Query strings and fragments are stripped; custom events and all other paths are rejected. No questions, answers, emails, conversation IDs or share tokens are analytics event data. The site privacy page describes service data separately.

The official SDK is version-pinned. The project analytics switch remains enabled on the existing Hobby allocation; no GA/GTM, paid upgrade or fabricated visitor events. Historical traffic before activation cannot be reconstructed. Google verification lives in `app/layout.tsx`; keep the tag after verification. Sitemap acceptance is not proof of indexing.

The old `lumina-puce-one.vercel.app` host redirects pages with HTTP 308, preserving path and query. `/api` compatibility stays on the original host to avoid cross-origin credential loss. Sessions are host-only; someone using an old bookmark may need to log in once on the primary host. No account migration or backend changes are required.

CI checks the locked installation, tests, lint and production build. Git main deploys through Vercel, but CI and deployment outcomes must be verified independently. For staged releases use `vercel deploy --prod --skip-domain`, verify with `vercel curl`, then `vercel promote`; retain the previous deployment ID for rollback.

## Search Console handoff status

2026-10-09: the URL-prefix property was added under the existing Google account, and its HTML-tag value was checked against the deployed homepage. Browser automation then failed with `Sky Computer Use native pipe startup failed` before Verify could be confirmed. Ownership verification and sitemap submission therefore remain pending; do not report them as complete. Resume the resource, choose HTML tag → Verify, then submit `sitemap.xml` once and check Success/discovered pages. The deployed sitemap itself returns valid XML with three canonical URLs.
