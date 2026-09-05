const WHATSAPP_NUMBER = "7002581794";
const UPI_NUMBER = "7002581794";

const form = document.getElementById("orderForm");
const fileInput = document.getElementById("projectFile");
const fileList = document.getElementById("fileList");
const successBox = document.getElementById("success");
const orderIdBox = document.getElementById("orderId");
const submitBtn = document.getElementById("submitBtn");

fileInput.addEventListener("change", () => {
  const files = [...fileInput.files];
  if (!files.length) {
    fileList.textContent = "No file selected";
    return;
  }
  fileList.innerHTML = files.map(f =>
    `✓ ${escapeHtml(f.name)} (${formatBytes(f.size)})`
  ).join("<br>");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("customerName").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const service = document.getElementById("service").value;
  const details = document.getElementById("details").value.trim();
  const files = [...fileInput.files];

  if (!name || !mobile || !service || !details) {
    alert("Please fill all required fields.");
    return;
  }

  const now = new Date();
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const orderId = `ADA-${datePart}-${randomPart}`;

  const fileText = files.length
    ? files.map(f => `${f.name} (${formatBytes(f.size)})`).join(", ")
    : "No file selected";

  const message =
`*NEW ORDER - ASSAM DIGITAL ASSIST*

Order ID: ${orderId}
Name: ${name}
Mobile: ${mobile}
Service: ${service}

Project Details:
${details}

UPI / WhatsApp Contact: ${UPI_NUMBER}

Selected File(s):
${fileText}

Please confirm my order.`;

  orderIdBox.textContent = orderId;
  successBox.classList.remove("hidden");
  submitBtn.textContent = "Opening WhatsApp...";

  const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener");

  setTimeout(() => {
    submitBtn.textContent = "Submit Order on WhatsApp";
  }, 1500);

  successBox.scrollIntoView({ behavior: "smooth", block: "center" });
});

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}
