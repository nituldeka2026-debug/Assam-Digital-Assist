require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const services = [
  { id: "data-entry", name: "Data Entry", price: 499, description: "Accurate and structured data entry service." },
  { id: "excel", name: "Excel / Google Sheets", price: 699, description: "Spreadsheet formatting, cleaning and data work." },
  { id: "web-research", name: "Web Research", price: 799, description: "Organised online research and data collection." },
  { id: "pdf-conversion", name: "PDF Conversion", price: 599, description: "Convert and format PDF documents into usable files." }
];

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_id VARCHAR(30) UNIQUE NOT NULL,
      service_id VARCHAR(100) NOT NULL,
      service_name VARCHAR(200) NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      customer_name VARCHAR(200) NOT NULL,
      mobile VARCHAR(30) NOT NULL,
      email VARCHAR(200),
      requirements TEXT,
      utr VARCHAR(100),
      payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
      order_status VARCHAR(30) NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
    CREATE INDEX IF NOT EXISTS idx_orders_mobile ON orders(mobile);
    CREATE INDEX IF NOT EXISTS idx_orders_utr ON orders(utr);
  `);
}

function makeOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `NITUL-${stamp}-${rand}`;
}

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

app.get("/api/services", (req, res) => res.json(services));

app.post("/api/orders", async (req, res) => {
  try {
    const { serviceId, customerName, mobile, email, requirements } = req.body;
    const service = services.find(s => s.id === serviceId);
    if (!service) return res.status(400).json({ error: "Invalid service" });
    if (!customerName?.trim() || !mobile?.trim()) {
      return res.status(400).json({ error: "Name and mobile are required" });
    }

    let orderId;
    for (;;) {
      orderId = makeOrderId();
      const exists = await pool.query("SELECT 1 FROM orders WHERE order_id=$1", [orderId]);
      if (!exists.rowCount) break;
    }

    const result = await pool.query(`
      INSERT INTO orders
      (order_id, service_id, service_name, amount, customer_name, mobile, email, requirements)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `, [orderId, service.id, service.name, service.price,
        customerName.trim(), mobile.trim(), email?.trim() || null, requirements?.trim() || null]);

    res.status(201).json({ order: result.rows[0], upiId: process.env.UPI_ID || "7002581794@upi" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create order" });
  }
});

app.get("/api/orders/:orderId", async (req, res) => {
  const result = await pool.query(
    `SELECT order_id,service_name,amount,customer_name,mobile,email,requirements,utr,
            payment_status,order_status,created_at,updated_at
     FROM orders WHERE order_id=$1`, [req.params.orderId]);
  if (!result.rowCount) return res.status(404).json({ error: "Order not found" });
  res.json(result.rows[0]);
});

app.post("/api/orders/:orderId/utr", async (req, res) => {
  const { utr } = req.body;
  if (!utr?.trim()) return res.status(400).json({ error: "UTR is required" });
  const result = await pool.query(`
    UPDATE orders SET utr=$1, payment_status='verification_pending', updated_at=NOW()
    WHERE order_id=$2 RETURNING order_id,payment_status,utr
  `, [utr.trim(), req.params.orderId]);
  if (!result.rowCount) return res.status(404).json({ error: "Order not found" });
  res.json(result.rows[0]);
});

app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const configuredUser = process.env.ADMIN_USERNAME || "admin";
  const configuredPass = process.env.ADMIN_PASSWORD || "CHANGE_ME";
  if (username !== configuredUser || password !== configuredPass) {
    return res.status(401).json({ error: "Invalid login" });
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token });
});

app.get("/api/admin/stats", auth, async (req, res) => {
  const r = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE payment_status='verification_pending')::int AS payment_pending,
      COUNT(*) FILTER (WHERE order_status='processing')::int AS processing,
      COUNT(*) FILTER (WHERE order_status='completed')::int AS completed,
      COUNT(*) FILTER (WHERE order_status='cancelled')::int AS cancelled
    FROM orders
  `);
  res.json(r.rows[0]);
});

app.get("/api/admin/orders", auth, async (req, res) => {
  const q = (req.query.q || "").trim();
  const result = q
    ? await pool.query(`
        SELECT * FROM orders
        WHERE order_id ILIKE $1 OR mobile ILIKE $1 OR customer_name ILIKE $1 OR utr ILIKE $1
        ORDER BY created_at DESC LIMIT 200`, [`%${q}%`])
    : await pool.query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`);
  res.json(result.rows);
});

app.patch("/api/admin/orders/:orderId", auth, async (req, res) => {
  const allowedPayment = ["pending", "verification_pending", "paid", "rejected"];
  const allowedStatus = ["new", "processing", "completed", "cancelled"];
  const { paymentStatus, orderStatus } = req.body;
  if (paymentStatus && !allowedPayment.includes(paymentStatus)) return res.status(400).json({error:"Invalid payment status"});
  if (orderStatus && !allowedStatus.includes(orderStatus)) return res.status(400).json({error:"Invalid order status"});

  const result = await pool.query(`
    UPDATE orders SET
      payment_status=COALESCE($1,payment_status),
      order_status=COALESCE($2,order_status),
      updated_at=NOW()
    WHERE order_id=$3 RETURNING *
  `, [paymentStatus || null, orderStatus || null, req.params.orderId]);

  if (!result.rowCount) return res.status(404).json({error:"Order not found"});
  res.json(result.rows[0]);
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

initDb().then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch(err => { console.error("Database init failed:", err); process.exit(1); });
