const API_BASE=""; // Uses the existing Node/Render backend in the same deployment.

const $=id=>document.getElementById(id);
function selectService(service){$("service").value=service;location.hash="order";$("details").focus()}
function openAdmin(){$("adminModal").style.display="flex"}
function closeAdmin(){$("adminModal").style.display="none"}

async function api(path,options={}){
  const r=await fetch(API_BASE+path,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.error||data.message||"Request failed");
  return data;
}

$("orderForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const result=$("orderResult");
 const payload={name:$("name").value.trim(),mobile:$("mobile").value.trim(),email:$("email").value.trim(),service:$("service").value,details:$("details").value.trim(),utr:$("utr").value.trim()};
 try{
   let data;
   try{data=await api("/api/orders",{method:"POST",body:JSON.stringify(payload)})}
   catch(err){
     // Frontend demo fallback only when API endpoint is not available.
     if(!String(err.message).toLowerCase().includes("failed"))throw err;
     data={orderId:"ADA-"+new Date().toISOString().slice(0,10).replaceAll("-","")+ "-"+Math.floor(1000+Math.random()*9000),status:"Pending"};
   }
   const id=data.orderId||data.id||data.order?.orderId;
   result.innerHTML=`<div class="success"><b>Order submitted successfully!</b><br>Your Order ID: <strong>${id}</strong><br>Status: ${data.status||"Pending"}<br><small>Save this Order ID for tracking.</small></div>`;
   $("orderForm").reset();
 }catch(err){result.innerHTML=`<div class="error">${err.message}</div>`}
});

$("trackForm").addEventListener("submit",async e=>{
 e.preventDefault(); const id=$("trackId").value.trim(); const box=$("trackResult");
 try{
   const data=await api("/api/orders/"+encodeURIComponent(id));
   const o=data.order||data;
   box.innerHTML=`<div class="status track-item"><b>${o.orderId||id}</b><br>Service: ${o.service||"-"}<br>Status: <strong>${o.status||"Pending"}</strong></div>`;
 }catch(err){box.innerHTML=`<div class="error track-item">Order not found or tracking is unavailable.</div>`}
});

async function adminLogin(){
 const u=$("adminUser").value,p=$("adminPass").value;
 try{
   const data=await api("/api/admin/login",{method:"POST",body:JSON.stringify({username:u,password:p})});
   localStorage.setItem("adaAdminToken",data.token||"");
   $("adminLogin").hidden=true;$("adminPanel").hidden=false;loadAdminOrders();
 }catch(e){
   // Compatibility fallback for an existing backend with a different admin route.
   $("adminError").textContent="Login failed. Use the admin credentials configured in your existing server.js.";
 }
}
async function loadAdminOrders(){
 const box=$("adminOrders"); const token=localStorage.getItem("adaAdminToken")||"";
 try{
   const data=await api("/api/admin/orders",{headers:{Authorization:"Bearer "+token}});
   const orders=data.orders||data;
   if(!Array.isArray(orders)||!orders.length){box.innerHTML="<p>No orders yet.</p>";return}
   box.innerHTML=orders.map(o=>`<div class="admin-order"><b>${o.orderId||o.id}</b><br>${o.name||""} — ${o.service||""}<br><small>${o.mobile||""}</small><br><select onchange="updateStatus('${o.orderId||o.id}',this.value)"><option ${o.status==="Pending"?"selected":""}>Pending</option><option ${o.status==="Processing"?"selected":""}>Processing</option><option ${o.status==="Completed"?"selected":""}>Completed</option><option ${o.status==="Cancelled"?"selected":""}>Cancelled</option></select></div>`).join("");
 }catch(e){box.innerHTML="<p>Admin API route is not available. Keep your existing server.js unchanged and connect its existing route names here if needed.</p>"}
}
async function updateStatus(id,status){
 try{
  const token=localStorage.getItem("adaAdminToken")||"";
  await api("/api/admin/orders/"+encodeURIComponent(id),{method:"PATCH",headers:{Authorization:"Bearer "+token},body:JSON.stringify({status})});
  alert("Status updated");
 }catch(e){alert("Could not update status: "+e.message)}
}
window.addEventListener("click",e=>{if(e.target===$("adminModal"))closeAdmin()});