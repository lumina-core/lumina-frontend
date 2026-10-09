# Search and traffic

Production: https://lumina-news-agent.vercel.app
Analytics: https://vercel.com/shanes-projects-025e82ba/lumina-news-agent/analytics
Search Console URL-prefix: https://lumina-news-agent.vercel.app/
Sitemap: https://lumina-news-agent.vercel.app/sitemap.xml

The homepage redirects to `/chat`. Only `/pricing` and `/privacy` are public, indexable and included in the sitemap. `/chat` requires login and is noindex, like concrete conversations. Account, authentication, concrete conversations and bearer share links inherit noindex and have explicit noindex response headers. Robots allows crawlers to see those directives; it is not authentication.

`components/PrivacyAnalytics.tsx` and `lib/analytics-policy.ts` allow pageviews on those same two paths only, on the HTTPS production origin. DNT or GPC disables collection. Query strings and fragments are stripped; custom events and all other paths are rejected. No questions, answers, emails, conversation IDs or share tokens are analytics event data. The site privacy page describes service data separately.

The official SDK is version-pinned. The project analytics switch remains enabled on the existing Hobby allocation; no GA/GTM, paid upgrade or fabricated visitor events. Historical traffic before activation cannot be reconstructed. Google verification lives in `app/layout.tsx`; keep the tag after verification. Sitemap acceptance is not proof of indexing.

The old `lumina-puce-one.vercel.app` host redirects pages with HTTP 308, preserving path and query. `/api` compatibility stays on the original host to avoid cross-origin credential loss. Sessions are host-only; someone using an old bookmark may need to log in once on the primary host. No account migration or backend changes are required.

CI checks the locked installation, tests, lint and production build. Git main deploys through Vercel, but CI and deployment outcomes must be verified independently. For staged releases use `vercel deploy --prod --skip-domain`, verify with `vercel curl`, then `vercel promote`; retain the previous deployment ID for rollback.

## Search Console verification and crawl status

2026-10-09: Search Console confirmed **Ownership auto verified**, using the HTML tag on the production homepage. Keep that tag in `app/layout.tsx`.

The exact `/sitemap.xml` URL was submitted. The report currently shows **Couldn't fetch / 0 discovered pages**, including after one retry. This is not a successful sitemap read. Google's live URL Inspection test at 20:36 (Asia/Shanghai) confirmed **Crawl allowed: Yes; Page fetch: Successful** for that same URL. Independent HTTP checks returned 200, `application/xml`, two canonical URLs, and an allowing robots.txt.

No site-side fetch restriction was found; the difference between the live test and sitemap report remains unresolved. Recheck the report after Google's next fetch (normally within the next few days); if it still fails, inspect the report's error details and repeat a live test before changing configuration. Do not repeatedly submit or rename the sitemap to chase a Success label. Ownership, fetchability, sitemap processing and actual indexing are separate states. See [Google's sitemap troubleshooting guidance](https://support.google.com/webmasters/answer/7451001?hl=en).

A rendered Google live test exposed the previous `/chat` classification error: its initial HTML allowed indexing, but the auth guard redirected anonymous visitors to the noindex login page. Chat remains protected and is now consistently excluded from sitemap and analytics. `/privacy` was added to the auth guard's public allowlist. Sitemap, analytics and the guard share `lib/site.ts` to prevent drift. Google reports no manual actions or security issues; `/chat` had already been discovered via the sitemap but was not indexed.
