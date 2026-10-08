# ⚡ Spark Community Website

This package contains the GitHub Pages frontend and a backend starter for the Spark Community billing system.

## Frontend
Upload the repository contents to GitHub and enable GitHub Pages.

Pages:
- `index.html` — separate Home page
- `services.html` — pricing/services
- `order.html` — order form
- `status.html` — order tracking UI
- `invoice.html` — printable invoice UI

## Important: live payment + email approval
GitHub Pages is static hosting. It must NOT contain:
- Razorpay secret key
- SMTP password
- Admin approval secrets
- Database credentials

Use a backend host such as Railway for these parts.

### Intended live workflow
1. Customer selects service.
2. Frontend sends order details to `POST /api/orders`.
3. Backend calculates the price (never trust a client-side price).
4. Backend creates the payment-gateway order.
5. Customer pays.
6. Frontend sends payment response to `POST /api/payment/verify`.
7. Backend verifies the signature.
8. Backend stores payment + order in MongoDB.
9. Backend emails `fzboy2008@gmail.com` with Approve / Cancel links.
10. Until one of those signed admin links is used, status stays `PROCESSING`.
11. Approve changes status to `APPROVED` and generates/sends the final invoice.
12. Cancel changes status to `CANCELLED` and records the reason.
13. Customer can track the order using its Order ID.

## Pricing rules
- Spark Bot All Features: ₹250/month
- Spark Bot Per Feature: ₹20/feature/month
- Discord Setup with All Features: FREE
- Discord Setup with Per Feature plan: ₹50 one-time
- Custom Bot Creation: ₹500 one-time
- Custom Bot with Spark Community panel: +₹300/month
- Custom Bot with customer's own VPS/panel: no Spark panel charge
- Future custom features can be added later with applicable development charges.

## Data retention behavior
For Spark Bot plans, setup data is intended to remain stored. If the bot is kicked and later re-added to the same server, the setup should be restored instead of requiring a complete reconfiguration.

The database should therefore key saved configuration by the Discord server/guild ID, not by a temporary bot membership/session.

## Email
Billing/contact email: `fzboy2008@gmail.com`

## Discord
`https://discord.gg/h5ejJAabPv`

## Next step
Replace the static `mailto:` fallback in `assets/app.js` with your deployed backend URL and implement the payment/email/database endpoints in `backend/server.js`.
