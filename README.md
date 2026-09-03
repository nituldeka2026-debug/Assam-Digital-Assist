# Professional Service Platform V1.0

## Included
- Customer responsive website
- Service selection and order creation
- Automatic Order ID
- Professional GPay/UPI payment page
- UTR submission
- Public order tracking
- WhatsApp support
- Admin login
- Admin dashboard and order search
- Payment verification/status management
- PostgreSQL database
- Render deployment configuration

## 1. Local setup

Install Node.js 18+.

```bash
npm install
```

Create `.env` from `.env.example` and fill in:
- DATABASE_URL
- JWT_SECRET
- ADMIN_USERNAME
- ADMIN_PASSWORD
- UPI_ID
- WHATSAPP_NUMBER

Then:

```bash
npm start
```

Open http://localhost:3000

Admin: http://localhost:3000/admin.html

## 2. Render

Create a PostgreSQL database on Render and copy its internal/external connection string into `DATABASE_URL`.

Create a Web Service from this project:
- Build Command: `npm install`
- Start Command: `npm start`

Set all secret environment variables in Render.

## Important payment note

`7002581794` is displayed as the GPay contact number, while the actual UPI ID used for the UPI deep-link is configurable through `UPI_ID`.

Do not mark an order as paid just because a customer submitted a UTR. Verify the transaction in the relevant payment/bank system before setting `payment_status=paid`.

## Customisation

Edit the `services` array near the top of `server.js` to change service names, descriptions and prices.
