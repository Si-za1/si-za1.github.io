# My Coffee Tales waitlist

The site is hosted on GitHub Pages, which serves static files only, so the waitlist uses [Formspree](https://formspree.io) to receive signups.

- **Form URL:** `https://formspree.io/f/xaeejvqg`
- **Where signups go:** the Formspree dashboard for the account that owns the form.
- **Plan limit:** the free plan allows 50 submissions per month. Upgrade if the list grows past that.

The previous Google Apps Script + Google Sheet integration has been removed from the site. Rows already collected in that Sheet remain there; new signups only go to Formspree.

## What visitors see

With JavaScript enabled, `script.js` submits the form with `fetch` and shows the result under it (`Brewing…`, `You’re on the list`, or an error). The page never navigates away. With JavaScript disabled, the form posts natively to Formspree and shows Formspree’s confirmation page instead.

The form includes `_subject`, `interest`, and `source` hidden fields plus a `_gotcha` honeypot for spam filtering.

## Changing the form

Update both places so the JavaScript and no-JavaScript paths use the same form:

1. `action` on `#coffee-waitlist-form` in `index.html`
2. `COFFEE_WAITLIST_ENDPOINT` in `script.js`

## Exporting signups

Use **Export** in the Formspree dashboard to download submissions as CSV. Do not commit the export to this public repository; `.gitignore` already blocks `waitlist.csv` and similar files.

## Testing

Open the live site in an incognito window, submit an email, confirm the inline success message, and check the Formspree dashboard for the submission.
