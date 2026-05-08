# Avatar Playback Test Page

## Purpose

`/avatar-playback-test` is a hidden diagnostic page for validating avatar video delivery in production.

It is not linked from the header, footer, sitemap, or marketing pages. It is intentionally available by direct URL so the team can test whether deployed video assets are being served correctly by Amplify/CloudFront.

## Public Test URL

- `https://myveevee.com/avatar-playback-test`

## Assets Under Test

The page tests the same public assets used by the Health Twin hero:

- `/avatar/hero-avatar-2.webm`
- `/avatar/hero-avatar-2.mp4`

Expected production responses:

- `.webm` should return `Content-Type: video/webm`
- `.mp4` should return `Content-Type: video/mp4`
- response body should be binary video data, not app HTML

## What The Page Shows

The page includes:

- a direct `WEBM Only` player
- a direct `MP4 Only` player
- a combined browser-choice player with `webm` first and `mp4` fallback
- direct links to open each asset
- media element diagnostics such as `currentSrc`, `networkState`, `readyState`, `duration`, and media error details
- fetch response diagnostics showing status, content type, content length, and the first response bytes/text

## Known Issue Fixed

On May 8, 2026, the playback page showed all three players failing because the asset URLs were returning the SPA HTML shell instead of video data.

Symptoms:

- player status was `error`
- asset response status appeared reachable
- `content-type` was `text/html`
- response body started with `<!doctype html>`

Root cause:

Amplify hosting rules were routing `/avatar/*` requests through the SPA fallback instead of serving the static files from the deployed build output.

Fix:

The Amplify hosting rule was updated so `/avatar/*` serves static assets directly. After the fix, the playback test page showed the video players in `can-play` state with the correct video content types.

## Related Code

- `src/pages/AvatarPlaybackTest.tsx`
- `src/pages/HealthTwinFunnel.tsx`
- `src/config/links.ts`
- `src/seo/routeMeta.ts`
- `public/avatar/hero-avatar-2.webm`
- `public/avatar/hero-avatar-2.mp4`
