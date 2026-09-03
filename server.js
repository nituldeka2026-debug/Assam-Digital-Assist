const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-this-password";
const GPay = "7002581794";
const DB_FILE = path.join(__dirname, "orders.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readOrders() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return []; }
}
function saveOrders(orders) {
  fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2));
}
function newOrderId() {
  const d = new Date();
  const stamp = d.toISOString().slice(0,10).replaceAll("-","");
  return `ADA-${stamp}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

app.get("/api/config", (req,res) => res.json({ gpay: GPay }));

app.post("/api/orders", (req,res) => {
  const { name, phone, service, amount, notes } = req.body;
  if (!name || !phone || !service) return res.status(400).json({error:"Name, phone and service are required."});
  const order = {
    orderId:newOrderId(), name, phone, service,
    amount:Number(amount)||0, notes:notes||"",
    paymentMethod:"GPay", paymentStatus:"Pending Verification",
    orderStatus:"Pending Payment", utr:"", createdAt:new Date().toISOString()
  };
  const orders=readOrders(); orders.unshift(order); saveOrders(orders);
  res.json({ok:true, order});
});

app.get("/api/orders/:id", (req,res) => {
  const o=readOrders().find(x=>x.orderId.toLowerCase()===req.params.id.toLowerCase());
  if(!o) return res.status(404).json({error:"Order not found"});
  res.json({order:o});
});

app.post("/api/orders/:id/payment", (req,res) => {
  const orders=readOrders();
  const o=orders.find(x=>x.orderId.toLowerCase()===req.params.id.toLowerCase());
  if(!o) return res.status(404).json({error:"Order not found"});
  if(!req.body.utr) return res.status(400).json({error:"UTR/Transaction ID required"});
  o.utr=String(req.body.utr).trim();
  o.paymentStatus="Submitted for Verification";
  o.updatedAt=new Date().toISOString();
  saveOrders(orders);
  res.json({ok:true, order:o});
});

function auth(req,res,next){
  if(req.headers["x-admin-password"] !== ADMIN_PASSWORD) return res.status(401).json({error:"Unauthorized"});
  next();
}
app.post("/api/admin/login",(req,res)=>{
  if(req.body.password !== ADMIN_PASSWORD) return res.status(401).json({error:"Invalid password"});
  res.json({ok:true});
});
app.get("/api/admin/orders",auth,(req,res)=>res.json({orders:readOrders()}));

app.patch("/api/admin/orders/:id",auth,(req,res)=>{
  const allowed=["Pending Payment","Order Received","Payment Confirmed","In Progress","Ready for Delivery","Delivered","Cancelled"];
  const orders=readOrders();
  const o=orders.find(x=>x.orderId.toLowerCase()===req.params.id.toLowerCase());
  if(!o) return res.status(404).json({error:"Order not found"});
  if(req.body.orderStatus && !allowed.includes(req.body.orderStatus)) return res.status(400).json({error:"Invalid status"});
  if(req.body.orderStatus) o.orderStatus=req.body.orderStatus;
  if(req.body.paymentStatus) o.paymentStatus=req.body.paymentStatus;
  o.updatedAt=new Date().toISOString();
  saveOrders(orders); res.json({ok:true,order:o});
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`Axom Digital Assist V1 running on port ${PORT}`));
