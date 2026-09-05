# Assam Digital Assist — New Frontend

This ZIP contains ONLY the replacement frontend files:
- index.html
- style.css
- script.js

Services added:
- Book Cover Design
- Book Layout
- Graphic Design
- Digital Assistance
- GPay reference: 7002581794
- UTR/Transaction ID
- Customer order tracking
- Admin login/order status UI
- WhatsApp support
- Mobile responsive design

IMPORTANT:
Do not replace server.js, package.json, render.yaml, public/, orders.json or .env files from this ZIP.
The frontend expects the existing backend API routes:
POST /api/orders
GET /api/orders/:orderId
POST /api/admin/login
GET /api/admin/orders
PATCH /api/admin/orders/:orderId

If your existing server.js uses different route names, keep server.js unchanged and adjust only script.js API paths.
