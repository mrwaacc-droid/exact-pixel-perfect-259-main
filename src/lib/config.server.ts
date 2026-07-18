// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client — values here never reach the browser.
//
// On Cloudflare Workers, env binds at REQUEST time. Module-scope reads
// (e.g. `const x = process.env.X`) resolve to undefined — always read
// process.env INSIDE a function or handler.
//
// When to use which env-access pattern:
//   - .server.ts module (this file): server-only helpers reused across
//     handlers. Wrap reads in a function so they run per-request.
//   - inline process.env inside a createServerFn handler: one-off reads
//     not reused elsewhere.
//   - import.meta.env.VITE_FOO: PUBLIC config readable from both client
//     and server (analytics IDs, public URLs). Define in .env with the
//     VITE_ prefix. Never put secrets here — they ship to the browser.

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    appUrl: process.env.APP_URL ?? process.env.VITE_APP_URL ?? process.env.PUBLIC_APP_URL ?? null,
    brand: {
      supportPhone: process.env.BRAND_SUPPORT_PHONE?.trim() || null,
      address: process.env.BRAND_ADDRESS?.trim() || null,
      twitterUrl: process.env.BRAND_TWITTER_URL?.trim() || null,
      linkedinUrl: process.env.BRAND_LINKEDIN_URL?.trim() || null,
      instagramUrl: process.env.BRAND_INSTAGRAM_URL?.trim() || null,
      facebookUrl: process.env.BRAND_FACEBOOK_URL?.trim() || null,
    },
  };
}
