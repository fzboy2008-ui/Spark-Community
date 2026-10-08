# Spark Community Billing Backend — Google Sheets + Gmail

This avoids MongoDB.

## 1. Create the database
Create a blank Google Sheet. Open **Extensions → Apps Script** and paste `Code.gs`.

## 2. Deploy
Deploy → New deployment → Web app
- Execute as: **Me**
- Who has access: **Anyone**

Copy the Web App URL.

## 3. Connect the website
Open `assets/app.js` and set:
`const BACKEND_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";`

Commit the change to GitHub.

## 4. Workflow
Customer → order form → UPI QR → UTR → Apps Script → Google Sheet + email to `fzboy2008@gmail.com`.

The email contains:
- Order details
- UTR
- APPROVE ORDER button
- CANCEL ORDER button

Until one is clicked, status is `PROCESSING`.

After approval/cancellation, the customer is emailed.

## Important
The current site intentionally uses manual UPI verification, not an automatic payment gateway. Google Pay, PhonePe and Paytm QR codes are shown on the order page.
