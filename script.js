const WHATSAPP_NUMBER = "917002581794";

const menu = document.querySelector(".menu");
const nav = document.querySelector("#nav");
menu?.addEventListener("click", () => nav.classList.toggle("open"));

function selectService(service){
  const select = document.querySelector("#service");
  if(select){ select.value = service; document.querySelector("#order")?.scrollIntoView({behavior:"smooth"}); }
}
document.querySelectorAll("[data-service]").forEach(el => {
  el.addEventListener("click", () => selectService(el.dataset.service));
});

const waUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
document.querySelector("#floatWA").href = waUrl;
document.querySelector("#footerWA").href = waUrl;

document.querySelector("#orderForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.querySelector("#name").value.trim();
  const phone = document.querySelector("#phone").value.trim();
  const service = document.querySelector("#service").value;
  const details = document.querySelector("#details").value.trim();

  const digits = phone.replace(/\D/g,"");
  if(digits.length !== 10){
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  const message = `Hello Axom Digital Assist,

I want to place an order.

Name: ${name}
Mobile: ${phone}
Service: ${service}
Requirements: ${details}

Please confirm the price and delivery time.

Thank you.`;

  window.open(`${waUrl}?text=${encodeURIComponent(message)}`, "_blank");
});
