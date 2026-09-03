// Replace this with your real WhatsApp number, digits only, including country code.
// Example: const WHATSAPP_NUMBER = "919876543210";
const WHATSAPP_NUMBER = "917002581794";

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector("#navLinks");
menuBtn?.addEventListener("click", () => nav.classList.toggle("open"));

document.querySelectorAll("[data-service]").forEach(btn => {
  btn.addEventListener("click", () => {
    const service = btn.dataset.service;
    document.querySelector("#service").value = service;
  });
});

const waFloat = document.querySelector("#waFloat");
waFloat.href = `https://wa.me/${WHATSAPP_NUMBER}`;

document.querySelector("#orderForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.querySelector("#name").value.trim();
  const phone = document.querySelector("#phone").value.trim();
  const service = document.querySelector("#service").value;
  const details = document.querySelector("#details").value.trim();

  const message =
`Hello Axom Digital Assist,

I want to place an order.

Name: ${name}
Mobile: ${phone}
Service: ${service}
Requirements: ${details}

Please confirm the price and delivery time.

Thank you.`;


  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
});
