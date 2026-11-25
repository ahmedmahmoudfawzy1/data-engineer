# EraaSoft – Data Engineering Diploma Landing Page

Static landing page built with HTML5, CSS3, vanilla JavaScript and Tailwind CSS (browser CDN build).

## Structure

```
index.html              Page markup (all sections)
css/style.css           Design system and component styles
js/script.js            Interactions, scroll animations, registration form
assets/logos/           EraaSoft logo
assets/images/tools/    Tool logos (optional, see below)
assets/images/projects/ Mini-project visuals (optional)
assets/images/capstone/ Capstone architecture visual (optional)
```

## Run locally

Open `index.html` directly in a browser, or serve the folder (recommended):

```
npx serve .
# or
python -m http.server 8000
```

An internet connection is needed for Tailwind CSS (CDN) and the Google Fonts (IBM Plex Sans / Mono).

## Connecting the backend

Open `js/script.js` and edit the `REGISTRATION_CONFIG` block at the top:

```js
const REGISTRATION_CONFIG = {
  endpoint: 'https://your-api.example/registrations', // currently empty
  method: 'POST',
  format: 'json',      // or 'formdata'
  headers: {},         // e.g. { 'X-CSRF-Token': '...' }
  timeoutMs: 15000,
};
```

Payload sent: `{ "fullName": "...", "email": "...", "phone": "..." }`.

- The success message is shown **only** when the API returns a 2xx status. If the response is JSON with a `message`, that text is shown.
- On a non-2xx response, an optional JSON body `{ "message": "...", "errors": { "email": "..." } }` is shown to the user, with errors attached to the matching fields.
- While `endpoint` is empty, valid submissions show "Online registration is not open yet". Nothing is faked.
- All network code is in `submitRegistration()`. Validation is in `validateRegistration()`.

## Adding images and logos

No image is requested until you set a path, so the page never shows broken images.

- **Tool logos**: in `index.html`, set `data-logo` on a `.tool-mark`, for example
  `<span class="tool-mark" data-logo="assets/images/tools/python.svg">Py</span>`.
  The monogram stays visible until the logo loads.
- **Project visuals**: set `data-img` on `.project-media`, for example `data-img="assets/images/projects/m1.webp"`.
  The image covers the card header (`object-fit: cover`), so use a 16:7 or wider image.
- **Capstone architecture**: set `data-img` on `.arch-media` to replace the built-in HTML diagram with an image.

## Languages (English / Arabic)

- The header button switches between English and Arabic. Arabic uses a full right-to-left layout and the IBM Plex Sans Arabic font.
- The choice is saved in the browser. You can also link to a language directly: `index.html?lang=ar` or `index.html?lang=en`.
- English text lives in `index.html`. Arabic text lives in `js/i18n-ar.js`.
- To translate a new piece of text, add `data-i18n="some.key"` to the element (or `data-i18n-attr="placeholder:some.key"` for an attribute) and add `'some.key': '...'` to `js/i18n-ar.js`.
- Technology names (Python, SSIS, Databricks…) are intentionally kept in English in both versions.
- Number ranges in Arabic are wrapped in `<span dir="ltr">…</span>` so they don't display reversed.
- The registration payload includes `lang` (`"en"` or `"ar"`), and the request sends an `Accept-Language` header, so the backend can reply in the visitor's language. Arabic-Indic digits typed in the phone field (٠١٢…) are converted to 0-9 before validation and sending.

## Pending content

- **Engineers Syndicate section** (`#syndicate`): needs the reference landing page URL. A visible placeholder marks where it goes.
