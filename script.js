// ================================
// ASSAM DIGITAL ASSIST
// WHATSAPP + UPI SYSTEM
// ================================

// IMPORTANT: Replace these two values.
const WHATSAPP_NUMBER = "7002581794";
const UPI_ID = "7002581794@upi";
const BUSINESS_NAME = "Assam Digital Assist";

document.getElementById("upiDisplay").textContent = UPI_ID;

function selectService(service) {
  document.getElementById("serviceName").value = service;
  document.getElementById("order").scrollIntoView({behavior:"smooth"});
}

function sendWhatsAppOrder() {
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const service = document.getElementById("serviceName").value;
  const details = document.getElementById("orderDetails").value.trim();
  const quantity = document.getElementById("quantity").value.trim();

  if (!name) return alert("Please enter your name.");
  if (!phone) return alert("Please enter your WhatsApp number.");
  if (!service) return alert("Please select a service.");
  if (!details) return alert("Please enter your order details.");
  if (WHATSAPP_NUMBER === "YOUR_WHATSAPP_NUMBER") {
    return alert("Please add your WhatsApp number in script.js first.");
  }

  const message = `Hello ${BUSINESS_NAME} 👋

I want to place an order.

👤 Name: ${name}
📱 WhatsApp Number: ${phone}
🛠️ Service: ${service}
📦 Quantity: ${quantity || "Not specified"}

📝 Order Details:
${details}

Please confirm my order and total amount.

Thank you.`;

  const whatsappURL = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  window.open(whatsappURL, "_blank");
}

function payUPI() {
  const amount = prompt("Enter the confirmed payment amount (₹):");
  if (!amount) return;

  if (UPI_ID === "YOUR_UPI_ID@upi") {
    return alert("Please add your UPI ID in script.js first.");
  }

  const upiURL = "upi://pay?pa=" + encodeURIComponent(UPI_ID) +
    "&pn=" + encodeURIComponent(BUSINESS_NAME) +
    "&am=" + encodeURIComponent(amount) +
    "&cu=INR";

  window.location.href = upiURL;
}

function sendPaymentWhatsApp() {
  if (WHATSAPP_NUMBER === "YOUR_WHATSAPP_NUMBER") {
    return alert("Please add your WhatsApp number in script.js first.");
  }

  const message = `Hello ${BUSINESS_NAME} 👋

I have completed the UPI payment.

I am sending my payment screenshot here.

Please verify the payment and confirm my order.`;

  const whatsappURL = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  window.open(whatsappURL, "_blank");
}
