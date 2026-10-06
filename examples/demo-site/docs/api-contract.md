# API contract: contact form

The frontend posts contact-form submissions here. This is a backend dependency; until it exists,
`main.js` uses the labelled mock in `mocks/contact.js` and shows a "Demo site" banner.

## POST /api/contact

Auth: none (public form). The server must rate-limit and validate; client validation is for speed only.

Request `application/json`:

```json
{ "name": "string, 2–100 chars", "email": "string, valid address", "message": "string, 10–2000 chars" }
```

Responses:

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ "ok": true, "id": "string" }` | Stored and an email/notification was queued |
| 400 | `{ "ok": false, "message": "string", "errors": { "field": "string" } }` | Validation failed; `message` is shown to the user |
| 429 | `{ "ok": false, "message": "string" }` | Rate limited |
| 5xx | `{ "ok": false, "message": "string" }` | Server error; the UI offers a retry |

To switch from the mock: set `CONTACT_ENDPOINT = '/api/contact'` in `main.js`. No UI changes are needed.
