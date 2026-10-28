# My Coffee Tales waitlist

The site is hosted on GitHub Pages, which serves static files only. A page cannot write a file onto the server, and this repository is public, so waitlist emails must never be committed to it.

Instead, the form sends every signup to a private Google Sheet through a small Google Apps Script Web App. Each new email becomes a row in the sheet, and you can download the sheet as CSV or TSV (both plain text) whenever you need it.

The form uses Formspree (`https://formspree.io/f/xaeejvqg`) as its no-JavaScript fallback. Once `COFFEE_WAITLIST_ENDPOINT` is filled in `script.js`, the form posts to the Google Web App first, and retries through Formspree automatically if Google does not answer within 12 seconds.

## What visitors see

The form submits into a hidden iframe, so the page never navigates away and the visitor never sees Google's confirmation page or its links. The Apps Script page posts a short result back to the site with a per-submission token, and the site shows it under the form (`Brewing…`, `You are on the list`, `You are already on the list`, or an error). If no reply arrives within 12 seconds, the site retries the same signup through Formspree (`Saving your spot another way…`) and shows success if that works. Only if both routes fail does it show the retry message.

## What gets stored

The script creates a `Waitlist` tab with these columns:

- Timestamp
- Email
- Interest
- Source

It ignores duplicate emails. The form also includes a hidden honeypot field to reduce spam, and the script caps the length of the stored values.

## Formspree fallback

If the Google Web App does not answer within 12 seconds, the page posts the signup to the Formspree form at `https://formspree.io/f/xaeejvqg` instead, so a Google outage does not lose the email. Those fallback submissions appear in the Formspree dashboard, not in the Google Sheet. The free Formspree plan allows 50 submissions per month; in normal operation none are used because Google answers first.

## Why not save the emails in a .txt file?

Because this is a static site, the only .txt file it could write is in the browser or in the repository:

- A browser download lives on the visitor's computer, not yours.
- A file committed to this public repository would expose every email address to anyone.
- GitHub Pages has no server process to append to a file.

The private Google Sheet is the secure equivalent: it appends one row per signup and is visible only to the Google account that owns it. Export it as `.csv` or `.tsv` from **File > Download** whenever you want a local copy; if you specifically want a `.txt`, download the TSV and rename it, since it is tab-separated plain text. The project's `.gitignore` already blocks `waitlist.csv` and similar files from being committed.

## One-time setup

1. Create a new Google Sheet and name it `My Coffee Tales Waitlist`. Keep it private and do not share it publicly.
2. In the sheet, open **Extensions > Apps Script**.
3. Delete the sample code and paste the contents of `waitlist/google-apps-script.gs`.
4. Optional: change `NOTIFY_EMAIL` at the top of the script to the inbox that should receive signup notifications.
5. Save the Apps Script project.
6. Click **Deploy > New deployment** and choose the type **Web app**.
   - Description: `My Coffee Tales waitlist`
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy** and authorize the script. Google will ask for permission to edit the spreadsheet and send email notifications.
8. Copy the Web app URL. It ends in `/exec`.
9. Open `script.js` in this project and paste that URL into `COFFEE_WAITLIST_ENDPOINT`:

   ```js
   const COFFEE_WAITLIST_ENDPOINT = 'https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID/exec';
   ```

10. Save the file, then commit and deploy the site.
11. Open the live site in a private/incognito window while signed out of Google. Submit a real email and confirm that:
    - the page stays put and shows the inline success message, with no Google links
    - a new row appears in the `Waitlist` tab
    - the notification email arrives

If you already collected signups through Formspree, export them from the Formspree dashboard and paste them into the sheet once.

## Updating the script later

The site and the deployed Web App are separate. Changing `waitlist/google-apps-script.gs` does nothing until you paste it into the Apps Script editor, save it, and deploy a **new version**:

1. Open **Deploy > Manage deployments**.
2. Edit the Web App deployment.
3. Set **Version** to **New version**.
4. Confirm **Who has access** is still **Anyone**, then deploy.

Changing only the access setting keeps the old code version. Publishing a test deployment is not enough either; the live `/exec` URL must be used.

## Download the list

In the Google Sheet, choose **File > Download > Comma-separated values (.csv)** or **Tab-separated values (.tsv)**. Do not commit the downloaded file.

## If something does not work

- **Visitors see "You need permission", a Google sign-in page, or a Google Drive page with links:** the deployment is not public. Open **Deploy > Manage deployments**, edit the Web App, set **Who has access** to **Anyone**, and deploy again. Test in a signed-out/incognito window; being signed in as the owner can hide this problem.
- **The form says "The waitlist couldn't confirm your signup":** both the Google Web App and the Formspree fallback failed. Check the visitor's connection or ad blocker, confirm the Formspree form is active, then confirm the deployed URL ends in `/exec`, the deployment access is `Anyone`, and the latest script version (the one that posts the result back) is deployed.
- **No rows appear:** confirm the deployment access is `Anyone` and the URL in `script.js` ends in `/exec`. If you edited the script, deploy a new version.
- **The page says "Script function not found: doGet" or "doPost":** the deployed version does not contain the code. Paste the script, save, then choose **Version: New version** and deploy.
- **The form still goes to Formspree:** `COFFEE_WAITLIST_ENDPOINT` is empty, `script.js` did not load, or JavaScript is disabled. The Formspree fallback still stores the submission.
- **No notification email:** check the Gmail account used for the deployment and the spam folder. The signup is still saved in the sheet.
- **Duplicate email:** the script does not add the same email twice. It shows an "already on the list" message.
- **No inline message, but a row was saved:** the deployed script is the older version that renders a page but does not post a result back. Paste the current `google-apps-script.gs` and deploy a new version.

## Privacy and security

- Keep the Google Sheet private.
- Do not commit a CSV or TXT export to the repository.
- The Apps Script URL is public because the form must reach it. The script only accepts submissions and never returns sheet contents.
- The result sent back to the page contains only a status and a short message, not the email address. The per-page token stops another page from faking a result.
- Formspree is only the fallback when JavaScript is disabled or no Google endpoint is configured.
