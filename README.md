# Axom Digital Assist — Online Service Platform V1

Features:
- Customer service order form
- Automatic unique Order ID
- GPay payment instructions to **7002581794**
- UTR/Transaction ID submission
- Customer order tracking
- Admin login and order management
- Statuses: Pending Payment, Order Received, Payment Confirmed, In Progress, Ready for Delivery, Delivered, Cancelled
- JSON order database for the starter version
- WhatsApp support button

## Run locally
1. Install Node.js 18+.
2. In this folder run: `npm install`
3. Set an admin password:
   - Windows PowerShell: `$env:ADMIN_PASSWORD="your-strong-password"`
   - Linux/Render: `ADMIN_PASSWORD=your-strong-password`
4. Run: `npm start`
5. Open `http://localhost:3000`

## Render
Create a Web Service from this project.
Build Command: `npm install`
Start Command: `npm start`
Environment Variable: `ADMIN_PASSWORD`

### Important
This V1 uses direct GPay payment and manual UTR verification. It does NOT automatically verify GPay payments. For production-scale automatic payment verification, replace this flow with a supported payment gateway/business UPI setup and server-side verification.
