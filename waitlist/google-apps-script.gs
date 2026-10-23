/**
 * My Coffee Tales waitlist receiver
 *
 * Bind this script to a private Google Sheet, then deploy it as a Web App.
 * Full setup steps are in waitlist/README.md.
 */

const NOTIFY_EMAIL = 'thedataaiengineer17@gmail.com';
const SHEET_NAME = 'Waitlist';
const SITE_URL = 'https://www.sizaadhikari.com.np/';
const WAITLIST_URL = SITE_URL + '#coffee-waitlist';
const HEADERS = ['Timestamp', 'Email', 'Interest', 'Source'];

function doGet() {
  return renderPage_(
    'My Coffee Tales waitlist',
    'My Coffee Tales waitlist',
    'This page receives waitlist signups. To join, use the form on the Cups and Chapters website.',
    'Go to the website',
    SITE_URL
  );
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(10000)) {
    return renderPage_(
      'One more try',
      'One more try',
      'The list is a little busy right now. Please try again in a moment.',
      'Back to the waitlist',
      WAITLIST_URL
    );
  }

  try {
    const params = getParams_(e);
    const email = String(params.email || '').trim().toLowerCase();
    const interest = String(params.interest || 'my-coffee-tales').trim();
    const source = String(params.source || 'website').trim();
    const gotcha = String(params._gotcha || '').trim();

    // A real visitor will never fill the hidden field.
    if (gotcha) {
      return successPage_(
        'You are on the list',
        'Thank you for joining the My Coffee Tales waitlist.'
      );
    }

    if (!isValidEmail_(email)) {
      return renderPage_(
        'One more try',
        'One more try',
        'That email address does not look quite right. Please go back and try again.',
        'Back to the waitlist',
        WAITLIST_URL
      );
    }

    const sheet = getSheet_();
    const alreadyOnList = hasEmail_(sheet, email);

    if (!alreadyOnList) {
      sheet.appendRow([new Date(), email, interest, source]);
      notifyOwner_(email, source);
    }

    if (alreadyOnList) {
      return successPage_(
        'You are already on the list',
        'This email is already on the My Coffee Tales waitlist. I will write to you when the app is ready.'
      );
    }

    return successPage_(
      'You are on the list',
      'Thank you for joining the My Coffee Tales waitlist. I will write to you when the app is ready.'
    );
  } catch (error) {
    return renderPage_(
      'One more try',
      'One more try',
      'Something went wrong while saving your email. Please try again in a little while.',
      'Back to the waitlist',
      WAITLIST_URL
    );
  } finally {
    lock.releaseLock();
  }
}

function getParams_(e) {
  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      return {};
    }
  }

  return {};
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#F1E8D7');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }

  return sheet;
}

function hasEmail_(sheet, email) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const emails = sheet
    .getRange(2, 2, lastRow - 1, 1)
    .getValues()
    .map(function (row) {
      return String(row[0] || '').trim().toLowerCase();
    });

  return emails.indexOf(email) !== -1;
}

function notifyOwner_(email, source) {
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'New My Coffee Tales waitlist signup',
      body: [
        'A new reader joined the My Coffee Tales waitlist.',
        '',
        'Email: ' + email,
        'Source: ' + source,
        'Time: ' + new Date().toString()
      ].join('\n')
    });
  } catch (error) {
    // The signup is still saved even if the notification fails.
  }
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function successPage_(heading, message) {
  return renderPage_(
    heading,
    heading,
    message,
    'Back to Cups and Chapters',
    SITE_URL
  );
}

function renderPage_(title, heading, message, linkLabel, linkUrl) {
  const html =
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>' + title + '</title>' +
    '<style>' +
    ':root { color-scheme: light; }' +
    'body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #F7F1E4; color: #211D18; font-family: Georgia, serif; }' +
    '.card { width: min(440px, calc(100% - 40px)); padding: 40px 32px; text-align: center; background: #FBF7EE; border: 1px solid #DED1BC; border-radius: 4px; box-shadow: 0 18px 40px -24px rgba(54, 39, 24, .35); }' +
    '.cup { width: 54px; height: 54px; margin: 0 auto 18px; color: #C4632F; }' +
    'h1 { margin: 0 0 12px; font-size: 30px; font-weight: 400; line-height: 1.15; }' +
    'p { margin: 0 0 24px; color: #6E6457; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.7; }' +
    'a { display: inline-block; padding: 12px 18px; background: #211D18; color: #F7F1E4; text-decoration: none; font-family: Helvetica, Arial, sans-serif; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; border-radius: 3px; }' +
    'a:hover { background: #C4632F; }' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<main class="card">' +
    '<svg class="cup" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M5 13h15v7a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6v-7Z"></path>' +
    '<path d="M20 15.5h2.2a3.5 3.5 0 0 1 0 7H20"></path>' +
    '<path d="M8.5 9.5c1.2-1.4 1.2-2.8 0-4.2M13.5 9.5c1.2-1.4 1.2-2.8 0-4.2M18.5 9.5c1.2-1.4 1.2-2.8 0-4.2" opacity=".6"></path>' +
    '</svg>' +
    '<h1>' + heading + '</h1>' +
    '<p>' + message + '</p>' +
    '<a href="' + linkUrl + '">' + linkLabel + '</a>' +
    '</main>' +
    '</body>' +
    '</html>';

  return HtmlService.createHtmlOutput(html).setTitle(title);
}
