# ⚡ Spark Community Website — Final

## Included
- Purple-gradient responsive Home page
- Services & pricing
- Spark Bot order flow
- Custom Bot order flow
- Google Pay / PhonePe / Paytm QR payment section
- UTR verification field
- Order tracking page
- Success page
- Printable invoice page
- Discord ticket/contact links
- Billing email: fzboy2008@gmail.com
- Google Sheets + Apps Script backend for order storage
- Email Approve / Cancel buttons

## Payment
This is **manual UPI payment**, not an automatic gateway:
1. Customer chooses GPay / PhonePe / Paytm.
2. QR is displayed.
3. Customer pays the exact amount.
4. Customer submits UTR.
5. Backend emails the admin.
6. Admin clicks Approve or Cancel.
7. Order status changes.

## Go live
Upload the repository contents to GitHub Pages.

Then follow `backend/SETUP.md` to deploy the Google Apps Script backend and paste its Web App URL into:
- `assets/app.js`
- `status.html`

## Note
The review cards on the Home page are presentation placeholders, not claims of real verified customer reviews. Replace them with actual customer reviews/testimonials before publishing as verified reviews.
