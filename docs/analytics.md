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

2026-10-09: ownership is verified by the HTML tag. The sitemap report shows **Success**. Its discovered-page count still shows the previous three URLs; the deployed sitemap now contains only `/pricing` and `/privacy` and has been resubmitted after this correction. Let the count refresh on Google's next processing pass.

Google live tests at 22:02 and 22:03 (Asia/Shanghai) confirmed that `/pricing` and `/privacy` are available to Google and can be indexed. Their index reports say **Discovered - currently not indexed** and reference this sitemap. No manual actions or security issues were detected. A manual indexing request for `/pricing` was rejected with **Quota Exceeded**; it was not accepted and was not retried.

A rendered live test exposed why `/chat` must stay excluded: anonymous visitors are redirected by the auth guard to the noindex login page. Chat remains protected, carries noindex in both metadata and response headers, and is excluded from sitemap and analytics. `/privacy` is public. The guard, sitemap and analytics share the public-path list in `lib/site.ts`; test rendered anonymous access rather than relying only on initial HTML metadata.

Ownership, fetchability, sitemap processing and actual indexing remain separate states. Recheck indexing after Google processes the pages; no repeated submissions are needed. See [Google's sitemap guidance](https://support.google.com/webmasters/answer/7451001?hl=en).
