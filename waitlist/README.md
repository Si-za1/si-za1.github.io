# My Coffee Tales waitlist

The site is hosted on GitHub Pages, which serves static files only. A page cannot write a CSV onto the server. The GitHub repository is also public, so waitlist emails must not be committed to it.

Instead, the form can send every signup to a private Google Sheet through a small Google Apps Script Web App. Each new email becomes a row in the sheet, and you can download the sheet as CSV whenever you need it.

The form currently uses Formspree. It switches to the Google Sheet after you complete the setup below and add the Web App URL to `script.js`.

## What gets stored

The script creates a `Waitlist` tab with these columns:

- Timestamp
- Email
- Interest
- Source

It ignores duplicate emails. The form also includes a hidden honeypot field to reduce spam.

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
11. Submit the form once with a real email and confirm that:
    - a new row appears in the `Waitlist` tab
    - the notification email arrives
    - the thank-you page links back to the site

If you already collected signups through Formspree, export them from the Formspree dashboard and paste them into the sheet once.

## Download the list as CSV

In the Google Sheet, choose **File > Download > Comma-separated values (.csv)**.

The project includes a `.gitignore` rule for `waitlist.csv`, so a downloaded copy will not be committed by accident. Never commit the list to this public repository.

## If you want a hard switch

The site changes the form action when the page loads, so JavaScript must be enabled. If you want the form to post to Google even with JavaScript disabled, replace the form `action` in `index.html` with the Web App URL as well.

## If something does not work

- **No rows appear:** Confirm the deployment access is `Anyone` and the URL in `script.js` ends in `/exec`. If you edited the script, deploy a new version.
- **The form goes to a Google sign-in page:** The deployment is still restricted. Open **Deploy > Manage deployments**, edit the Web App, set **Who has access** to `Anyone`, and deploy again. Publishing a test deployment is not enough. The live `/exec` URL must allow public access.
- **The page says "Script function not found: doGet" or "doPost":** The deployed version does not contain the code. Confirm `google-apps-script.gs` is pasted into the project and saved. Then open **Deploy > Manage deployments**, edit the deployment, choose **Version: New version**, and deploy. Changing only the access setting keeps the old version, which may still be empty.
- **The form still goes to Formspree:** `COFFEE_WAITLIST_ENDPOINT` is empty, or `script.js` did not load.
- **No notification email:** Check the Gmail account used for the deployment and the spam folder. The signup is still saved in the sheet.
- **Duplicate email:** The script does not add the same email twice. It shows an "already on the list" message.
- **Two destinations:** Only one destination receives each submission. To send to both Formspree and the sheet, you would need a separate integration.

## Privacy

- Keep the Google Sheet private.
- Do not commit a CSV export to the repository.
- The Apps Script URL is public because the form must reach it. The script only accepts submissions and does not expose the sheet.
