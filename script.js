// Firebase Init (Apni Firebase Config details dalein)
const firebaseConfig = {
  apiKey: "AIzaSyYOUR_API_KEY",
  authDomain: "spark-community.firebaseapp.com",
  databaseURL: "https://spark-community-default-rtdb.firebaseio.com",
  projectId: "spark-community"
};
if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// 17 Per-Feature Items List
const availableFeatures = [
  "Welcome System", "Ticket System", "Store System", "Invite System",
  "Giveaway System", "Say System", "Goodbye System", "Auto Moderation",
  "Anti-Nuke", "Auto Response", "Server Stats", "VC Generator",
  "Staff Application System", "YouTube Upload Notifications",
  "Onboarding Buttons", "Nitro Emoji Converter", "Custom Bot Logo"
];

// 5 Affiliate Referral Coupons (10% Discount)
const validCoupons = [
  "Sprk-731-petls",
  "Sprk-981-glxy",
  "Sprk-761-vortx",
  "Sprk-720-bloom",
  "Sprk-719-sprky"
];

// Authorized Admins only
const authorizedAdminEmails = [
  "fzboy2008@gmail.com",
  "fouzanwani2008@gmail.com"
];

let activeCheckout = {
  plan: '',
  details: '',
  rawPrice: 0,
  finalPrice: 0,
  appliedCoupon: null
};

// Populate Features Checkboxes in plans.html
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("featuresList");
  if (container) {
    availableFeatures.forEach((feat, index) => {
      const label = document.createElement("label");
      label.className = "feature-item-label";
      label.innerHTML = `
        <input type="checkbox" value="${feat}" onchange="recalculatePerFeature()">
        <span><strong>${index + 1}.</strong> ${feat} — <em>₹20/mo</em></span>
      `;
      container.appendChild(label);
    });
  }

  // Auto load query string for order tracking (?id=SPK-xxxx)
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get('id');
  if (trackId && document.getElementById('searchOrderId')) {
    document.getElementById('searchOrderId').value = trackId;
    trackOrder();
  }
});

// Calculate Per-Feature Selections
function recalculatePerFeature() {
  const checked = document.querySelectorAll('#featuresList input[type="checkbox"]:checked');
  const count = checked.length;
  const itemsPrice = count * 20;
  const setupPrice = count > 0 ? 50 : 0;
  const total = itemsPrice + setupPrice;

  document.getElementById("selectedCount").innerText = count;
  document.getElementById("itemsPrice").innerText = itemsPrice;
  document.getElementById("setupPrice").innerText = setupPrice;
  document.getElementById("perFeatureTotal").innerText = total;

  document.getElementById("btnOrderFeatures").disabled = count === 0;
}

function checkoutFeatures() {
  const checked = Array.from(document.querySelectorAll('#featuresList input[type="checkbox"]:checked')).map(cb => cb.value);
  const total = (checked.length * 20) + 50;
  openCheckoutModal("Spark Bot (Custom Features)", checked.join(", "), total);
}

// Core Plan Selection
function selectCorePlan(name, price) {
  openCheckoutModal(name, "All 17+ Features Included + Free Discord Setup", price);
}

// Custom Bot Calculation
function updateCustomTotal() {
  const panel = parseInt(document.getElementById("customPanelSelect").value);
  const total = 500 + panel;
  document.getElementById("customTotalDisplay").innerText = `Total: ₹${total}`;
}

function selectCustomPlan() {
  const panel = parseInt(document.getElementById("customPanelSelect").value);
  const panelText = panel === 300 ? "Spark 24/7 Hosting Panel (₹300/mo)" : "Self Hosted VPS (₹0)";
  openCheckoutModal("Custom Bot Creation", `Base: ₹500 | Panel: ${panelText}`, 500 + panel);
}

// Open Checkout Modal
function openCheckoutModal(planName, details, price) {
  activeCheckout = {
    plan: planName,
    details: details,
    rawPrice: price,
    finalPrice: price,
    appliedCoupon: null
  };

  document.getElementById("mPlanName").innerText = planName;
  document.getElementById("mOriginalPrice").innerText = price;
  document.getElementById("mFinalPrice").innerText = price;
  document.getElementById("mDiscountRow").style.display = "none";
  document.getElementById("couponInput").value = "";
  document.getElementById("couponMsg").innerText = "";

  document.getElementById("checkoutModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("checkoutModal").style.display = "none";
}

// Coupon Logic (10% Discount)
function applyCoupon() {
  const code = document.getElementById("couponInput").value.trim();
  const feedback = document.getElementById("couponMsg");

  if (validCoupons.includes(code)) {
    const discount = Math.round(activeCheckout.rawPrice * 0.10);
    activeCheckout.finalPrice = activeCheckout.rawPrice - discount;
    activeCheckout.appliedCoupon = code;

    document.getElementById("mDiscountAmount").innerText = discount;
    document.getElementById("mDiscountRow").style.display = "block";
    document.getElementById("mFinalPrice").innerText = activeCheckout.finalPrice;

    feedback.style.color = "#10b981";
    feedback.innerText = `Success: Coupon Applied! 10% Discount (-₹${discount})`;
  } else {
    feedback.style.color = "#ef4444";
    feedback.innerText = "Invalid Coupon Code! Check active staff codes.";
  }
}

// Form Submission -> Push to Firebase and trigger email
async function handleOrderSubmission(e) {
  e.preventDefault();
  const orderId = "SPK-" + Math.floor(1000 + Math.random() * 9000);
  const payload = {
    orderId: orderId,
    clientName: document.getElementById("custName").value,
    clientEmail: document.getElementById("custEmail").value,
    plan: activeCheckout.plan,
    details: activeCheckout.details,
    requirements: document.getElementById("custDetails").value,
    amount: activeCheckout.finalPrice,
    utr: document.getElementById("utrCode").value,
    coupon: activeCheckout.appliedCoupon || "NONE",
    status: "Processing",
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  await firebase.database().ref('orders/' + orderId).set(payload);

  alert(`Order Placed Successfully!\nOrder ID: ${orderId}\nStatus: Processing\nVerification details have been forwarded to fzboy2008@gmail.com.`);
  closeModal();
  window.location.href = `orders.html?id=${orderId}`;
}

// Order & Invoice Tracking
async function trackOrder() {
  const id = document.getElementById("searchOrderId").value.trim();
  if (!id) return;

  const snapshot = await firebase.database().ref('orders/' + id).once('value');
  const data = snapshot.val();

  const invWrapper = document.getElementById("invoiceContainer");
  if (!data) {
    alert("Order ID nahi mila! Kripya sahi ID enter karein.");
    invWrapper.style.display = "none";
    return;
  }

  invWrapper.style.display = "block";
  document.getElementById("invNumber").innerText = data.orderId;
  document.getElementById("invCustomerName").innerText = data.clientName;
  document.getElementById("invCustomerEmail").innerText = data.clientEmail;
  document.getElementById("invDate").innerText = data.date;
  document.getElementById("invUtr").innerText = data.utr;
  document.getElementById("invItemName").innerText = data.plan;
  document.getElementById("invItemDetails").innerText = data.details || data.requirements;
  document.getElementById("invItemPrice").innerText = data.amount;
  document.getElementById("invSubTotal").innerText = data.amount;
  document.getElementById("invFinalTotal").innerText = data.amount;

  const badge = document.getElementById("invStatusBadge");
  badge.innerText = data.status;
  badge.className = `badge-status badge-${data.status}`;

  const instruction = document.getElementById("invInstructionBox");
  if (data.status === "Processing") {
    instruction.innerText = "Order verification pending by Admin (fzboy2008@gmail.com). UTR verify hote hi status Approved ho jayega.";
  } else if (data.status === "Approved") {
    instruction.innerText = "Order Approved! Aapka bot claim karne ke liye hamare Discord Server par ticket create karein.";
  } else {
    instruction.innerText = "Order Cancelled. Kripya transaction issue ke liye Discord par staff se contact karein.";
  }
}

// Google Auth Login for Admin
function googleAdminLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then((res) => {
    const email = res.user.email;
    if (authorizedAdminEmails.includes(email)) {
      document.getElementById("loginGate").style.display = "none";
      document.getElementById("adminPanel").style.display = "block";
      document.getElementById("currentAdminEmail").innerText = email;
      loadAdminOrders();
    } else {
      firebase.auth().signOut();
      document.getElementById("adminErrorMsg").innerText = "Unauthorized Account: Sirf authorized emails hi login kar sakti hain.";
    }
  }).catch((err) => {
    document.getElementById("adminErrorMsg").innerText = err.message;
  });
}

function logoutAdmin() {
  firebase.auth().signOut().then(() => location.reload());
}

function loadAdminOrders() {
  const table = document.getElementById("ordersListTable");
  firebase.database().ref('orders').on('value', (snap) => {
    table.innerHTML = "";
    const orders = snap.val();
    if (!orders) return;

    Object.keys(orders).forEach((key) => {
      const o = orders[key];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${o.orderId}</strong></td>
        <td>${o.clientName}<br><small>${o.clientEmail}</small></td>
        <td>${o.plan}</td>
        <td><code>${o.utr}</code></td>
        <td>₹${o.amount}</td>
        <td><small>${o.coupon}</small></td>
        <td><span class="badge-status badge-${o.status}">${o.status}</span></td>
        <td>
          <button class="btn-approve" onclick="updateOrderStatus('${o.orderId}', 'Approved')">Approve</button>
          <button class="btn-cancel" onclick="updateOrderStatus('${o.orderId}', 'Cancelled')">Cancel</button>
        </td>
      `;
      table.appendChild(tr);
    });
  });
}

function updateOrderStatus(id, newStatus) {
  firebase.database().ref('orders/' + id).update({ status: newStatus }).then(() => {
    alert(`Order ${id} marked as ${newStatus}!`);
  });
}
  
