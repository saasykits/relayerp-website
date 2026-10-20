# Relay ERP website

The marketing site for [relayerp.app](https://relayerp.app): the landing page, the cookie policy
and the privacy policy.

This repository is public so it can be deployed, but it is **not open source**. Copying,
reusing or redeploying it is not allowed. See [LICENSE](LICENSE).

## Structure

| Path                 | Page or purpose                                                   |
| -------------------- | ----------------------------------------------------------------- |
| `index.html`         | Landing page                                                      |
| `cookies/index.html` | Cookie policy (`/cookies/`)                                       |
| `privacy/index.html` | Privacy policy (`/privacy/`)                                      |
| `assets/site.js`     | Cookie consent, cookie settings and the pricing period switch     |
| `assets/config.js`   | Google Analytics measurement ID and Meta Pixel ID (empty = off)   |
| `logo.svg`           | Favicon and logo                                                  |

It is a static site with no build step and no dependencies.

## Deploy

Any static host works. Serve the repository root as the site root so `/cookies/` and
`/privacy/` resolve to their `index.html`.

- **Vercel / Netlify / Cloudflare Pages:** import the repository, set no build command and use
  the repository root as the output directory.
- **GitHub Pages:** Settings → Pages → deploy from the `main` branch, root folder.

## Analytics and advertising

Google Analytics and Meta Pixel are off until a visitor agrees in the cookie banner, and stay
off until their IDs are set in `assets/config.js`:

```js
window.RELAY_CONFIG = {
  gaMeasurementId: "G-XXXXXXXXXX",
  metaPixelId: "123456789012345",
};
```

The visitor's choice is stored in `localStorage` under `relay_consent`. Raising
`CONSENT_VERSION` in `assets/site.js` asks every visitor again, for example after a policy
change. Withdrawing consent reloads the page so the trackers stop.

## Contact form

The contact form posts to StaticForms with the site's public form key. Messages arrive at the
address configured in the StaticForms account.

## Local preview

```bash
python3 -m http.server 4600
```

Then open http://localhost:4600.
