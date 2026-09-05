const PHONE="917002581794";
const services=[
 ["🌐","Website Design","Business websites, landing pages and web solutions."],
 ["🎨","Poster / Logo Design","Clean posters, logos and digital graphics."],
 ["📝","Document Work","Professional document formatting and preparation."],
 ["📋","Online Form Filling","Help with online applications and forms."],
 ["⌨️","Typing / Data Entry","Typing, spreadsheet and structured data work."],
 ["📄","PDF Work","PDF conversion, editing and document assistance."],
 ["📢","Digital Marketing","Basic digital promotion and online presence support."],
 ["💻","Other Digital Services","Have a different requirement? Ask us."]
];
const grid=document.getElementById("serviceGrid"), select=document.getElementById("service");
services.forEach((s,i)=>{
 const card=document.createElement("article"); card.className="service-card";
 card.innerHTML=`<div class="service-icon">${s[0]}</div><h3>${s[1]}</h3><p>${s[2]}</p><a class="small-btn" href="#order" data-service="${s[1]}">ORDER NOW →</a>`;
 grid.appendChild(card);
 const opt=document.createElement("option"); opt.value=s[1]; opt.textContent=s[1]; select.appendChild(opt);
});
document.addEventListener("click",e=>{
 const link=e.target.closest("[data-service]");
 if(link){select.value=link.dataset.service;}
});
document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("navMenu").classList.toggle("open"));
document.querySelectorAll("#navMenu a").forEach(a=>a.addEventListener("click",()=>document.getElementById("navMenu").classList.remove("open")));

function makeOrderId(){
 const d=new Date(), pad=n=>String(n).padStart(2,"0");
 const date=`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
 return `ADA-${date}-${Math.floor(1000+Math.random()*9000)}`;
}
function getOrders(){return JSON.parse(localStorage.getItem("adaOrders")||"{}")}
function saveOrder(order){const all=getOrders();all[order.id]=order;localStorage.setItem("adaOrders",JSON.stringify(all))}
document.getElementById("orderForm").addEventListener("submit",e=>{
 e.preventDefault();
 const name=document.getElementById("name").value.trim(), phone=document.getElementById("phone").value.trim();
 const service=select.value, requirement=document.getElementById("requirement").value.trim();
 if(!/^[0-9]{10}$/.test(phone)){alert("Please enter a valid 10-digit mobile number.");return}
 const id=makeOrderId();
 const order={id,name,phone,service,requirement,status:"Pending",created:new Date().toISOString()};
 saveOrder(order);
 const msg=`Hello Assam Digital Assist,%0A%0A*New Order*%0AOrder ID: ${id}%0AName: ${encodeURIComponent(name)}%0AMobile: ${encodeURIComponent(phone)}%0AService: ${encodeURIComponent(service)}%0ARequirement: ${encodeURIComponent(requirement)}%0A%0APlease confirm my order.`;
 window.open(`https://wa.me/${PHONE}?text=${msg}`,"_blank");
 document.getElementById("orderForm").reset();
 document.getElementById("trackId").value=id;
 document.getElementById("trackResult").innerHTML=`<div class="result-card"><b>Order created:</b> ${id}<br><span class="status">Pending</span><br><small>Save this Order ID for tracking.</small></div>`;
});
document.getElementById("trackBtn").addEventListener("click",()=>{
 const id=document.getElementById("trackId").value.trim().toUpperCase(), o=getOrders()[id], box=document.getElementById("trackResult");
 if(!o){box.innerHTML=`<div class="result-card">❌ Order not found on this device. Please check the Order ID or contact us on WhatsApp.</div>`;return}
 box.innerHTML=`<div class="result-card"><b>${o.id}</b><br>Service: ${o.service}<br>Status: <span class="status">${o.status}</span><br><small>Created: ${new Date(o.created).toLocaleString()}</small></div>`;
});
