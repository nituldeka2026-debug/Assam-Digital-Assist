let currentOrder = null;
const $ = id => document.getElementById(id);

async function loadServices(){
  const r = await fetch("/api/services");
  const services = await r.json();
  $("serviceGrid").innerHTML = services.map(s => `
    <article class="service">
      <p class="eyebrow">SERVICE</p>
      <h3>${escapeHtml(s.name)}</h3>
      <p>${escapeHtml(s.description)}</p>
      <div class="price">₹${Number(s.price).toLocaleString("en-IN")}</div>
      <button class="btn primary" onclick='selectService(${JSON.stringify(s)})'>Order Now</button>
    </article>`).join("");
}
function selectService(s){
  $("order").classList.remove("hidden");
  $("payment").classList.add("hidden");
  $("selectedService").textContent = `${s.name} — ₹${s.price}`;
  $("serviceId").value = s.id;
  $("order").scrollIntoView({behavior:"smooth"});
}
$("orderForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const body = {
    serviceId:$("serviceId").value,
    customerName:$("customerName").value,
    mobile:$("mobile").value,
    email:$("email").value,
    requirements:$("requirements").value
  };
  const r = await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data = await r.json();
  if(!r.ok) return $("orderResult").innerHTML=`<div class="status">${escapeHtml(data.error)}</div>`;
  currentOrder=data.order;
  $("orderResult").innerHTML=`<div class="status">Order created: <strong>${data.order.order_id}</strong><br>Proceeding to payment...</div>`;
  showPayment(data.order, data.upiId);
});
function showPayment(order, upi){
  $("payment").classList.remove("hidden");
  $("payOrder").textContent=order.order_id;
  $("payAmount").textContent="₹"+Number(order.amount).toLocaleString("en-IN");
  $("upiId").textContent=upi;
  $("upiButton").href=`upi://pay?pa=${encodeURIComponent(upi)}&pn=NITUL%20Services&am=${order.amount}&cu=INR&tn=${encodeURIComponent(order.order_id)}`;
  $("payment").scrollIntoView({behavior:"smooth"});
}
$("utrForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const r=await fetch(`/api/orders/${currentOrder.order_id}/utr`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({utr:$("utr").value})});
  const d=await r.json();
  $("utrResult").innerHTML=`<div class="status">${r.ok?"✓ UTR submitted. Admin will verify your payment.":escapeHtml(d.error)}</div>`;
});
$("trackForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const r=await fetch(`/api/orders/${encodeURIComponent($("trackId").value.trim())}`);
  const d=await r.json();
  if(!r.ok)return $("trackResult").innerHTML=`<div class="status">${escapeHtml(d.error)}</div>`;
  $("trackResult").innerHTML=`<div class="status">
    <strong>${escapeHtml(d.service_name)}</strong><br>
    Order: ${escapeHtml(d.order_id)}<br>
    Amount: ₹${Number(d.amount).toLocaleString("en-IN")}<br>
    Payment: <strong>${escapeHtml(d.payment_status)}</strong><br>
    Order Status: <strong>${escapeHtml(d.order_status)}</strong><br>
    Created: ${new Date(d.created_at).toLocaleString("en-IN")}
  </div>`;
});
function copyUPI(){navigator.clipboard?.writeText($("upiId").textContent);alert("UPI ID copied");}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
$("waBtn").href="https://wa.me/"+(window.WHATSAPP_NUMBER||"917002581794")+"?text="+encodeURIComponent("Hello, I need help with my order.");
loadServices();
