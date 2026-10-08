// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2-XllE7e9xeK8p4vOCnNMHyGPSK-Hi70",
  authDomain: "spark-98139.firebaseapp.com",
  databaseURL: "https://spark-98139-default-rtdb.firebaseio.com",
  projectId: "spark-98139",
  storageBucket: "spark-98139.firebasestorage.app",
  messagingSenderId: "243369310858",
  appId: "1:243369310858:web:d27d9e595825eb6b95cb73",
  measurementId: "G-FTSXDP16LP"
};

if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// 17 Features List
const availableFeatures = [
  "Welcome System", "Ticket System", "Store System", "Invite System",
  "Giveaway System", "Say System", "Goodbye System", "Auto Moderation",
  "Anti-Nuke", "Auto Response", "Server Stats", "VC Generator",
  "Staff Application System", "YouTube Upload Notifications",
  "Onboarding Buttons", "Nitro Emoji Converter", "Custom Bot Logo"
];

// Staff Affiliate Mapping (10% Commission to Staff)
const staffAffiliateMap = {
  "Sprk-731-petls": "Darequeen",
  "Sprk-981-glxy": "Galaxy Promoter",
  "Sprk-761-vortx": "Vortex Promoter",
  "Sprk-720-bloom": "Bloom Promoter",
  "Sprk-719-sprky": "Sparky Promoter"
};

const authorizedAdminEmails = [
  "fzboy2008@gmail.com",
  "fouzanwani2008@gmail.com"
];

let activeCheckout = {
  plan: '',
  details: '',
  price: 0,
  promoterCode: "NONE",
  promoterStaff: "NONE",
  staffCommission: 0
};

document.addEventListener("DOMContentLoaded", () => {
  const featuresContainer = document.getElementById("featuresList");
  if (featuresContainer) {
    featuresContainer.innerHTML = "";
    availableFeatures.forEach((feat, index) => {
      const label = document.createElement("label");
      label.className = "feature-item-label";
      label.innerHTML = `
        <input type="checkbox" value="${feat}" onchange="recalculatePerFeature()">
        <span><strong>${index + 1}.</strong> ${feat} — <em>₹20</em></span>
      `;
      featuresContainer.appendChild(label);
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get('id');
  if (trackId && document.getElementById('searchOrderId')) {
    document.getElementById('searchOrderId').value = trackId;
    trackOrder();
  }

  if (typeof firebase !== 'undefined' && firebase.auth && document.getElementById('loginGate')) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user && authorizedAdminEmails.includes(user.email)) {
        document.getElementById("loginGate").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        document.getElementById("currentAdminEmail").innerText = user.email;
        loadAdminOrders();
      }
    });
  }
});

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
  openCheckoutModal("Spark Bot (Selected Features)", checked.join(", "), total);
}

function selectCorePlan(name, price) {
  openCheckoutModal(name, "All 17+ Features Included + Free Discord Setup", price);
}

function updateCustomTotal() {
  const selectElem = document.getElementById("customPanelSelect");
  if (!selectElem) return;
  const panel = parseInt(selectElem.value, 10);
  document.getElementById("customTotalDisplay").innerText = `Total: ₹${500 + panel}`;
}

function selectCustomPlan() {
  const selectElem = document.getElementById("customPanelSelect");
  const panel = selectElem ? parseInt(selectElem.value, 10) : 0;
  const panelText = panel === 300 ? "Spark 24/7 Hosting Panel (₹300/mo)" : "Self Hosted VPS (₹0)";
  openCheckoutModal("Custom Bot Creation", `Base: ₹500 | Panel: ${panelText}`, 500 + panel);
}

// Open Paytm Checkout Modal & Set UPI Deep Link
function openCheckoutModal(planName, details, price) {
  activeCheckout = {
    plan: planName,
    details: details,
    price: price,
    promoterCode: "NONE",
    promoterStaff: "NONE",
    staffCommission: 0
  };

  document.getElementById("mPlanName").innerText = planName;
  document.getElementById("mFinalPrice").innerText = price;
  
  // Dynamic UPI Intent Link for Mobile
  const upiLink = `upi://pay?pa=6006283334@ptyes&pn=Fouzan%20Tariq&am=${price}&cu=INR&tn=Spark%20Bot%20Payment`;
  document.getElementById("paytmDeepLink").setAttribute("href", upiLink);

  document.getElementById("couponInput").value = "";
  document.getElementById("couponMsg").innerText = "";
  document.getElementById("checkoutModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("checkoutModal").style.display = "none";
}

// Staff Affiliate Verification (Price same, 10% Staff profit tracked)
function applyStaffCoupon() {
  const code = document.getElementById("couponInput").value.trim();
  const msg = document.getElementById("couponMsg");

  if (staffAffiliateMap[code]) {
    const promoter = staffAffiliateMap[code];
    const commission = Math.round(activeCheckout.price * 0.10);

    activeCheckout.promoterCode = code;
    activeCheckout.promoterStaff = promoter;
    activeCheckout.staffCommission = commission;

    msg.style.color = "#10b981";
    msg.innerText = `Verified! Promoter: ${promoter} (10% Payout ₹${commission} will be credited to promoter)`;
  } else {
    msg.style.color = "#ef4444";
    msg.innerText = "Invalid promoter code!";
  }
}

// Submit Order to Firebase Realtime DB
async function handleOrderSubmission(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerText = "Submitting...";

  const orderId = "SPK-" + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const payload = {
    orderId: orderId,
    clientName: document.getElementById("custName").value.trim(),
    clientEmail: document.getElementById("custEmail").value.trim(),
    plan: activeCheckout.plan,
    details: activeCheckout.details,
    requirements: document.getElementById("custDetails").value.trim(),
    amount: activeCheckout.price,
    utr: document.getElementById("utrCode").value.trim(),
    promoterCode: activeCheckout.promoterCode,
    promoterStaff: activeCheckout.promoterStaff,
    staffProfit: activeCheckout.staffCommission,
    status: "Processing",
    date: formattedDate,
    timestamp: now.toISOString()
  };

  try {
    await firebase.database().ref('orders/' + orderId).set(payload);
    alert(`Order Placed!\nOrder ID: ${orderId}\nApproval under fzboy2008@gmail.com.`);
    closeModal();
    window.location.href = `orders.html?id=${orderId}`;
  } catch (error) {
    alert("Error: " + error.message);
    submitBtn.disabled = false;
  }
}

// Track Order & Invoice
async function trackOrder() {
  const idInput = document.getElementById("searchOrderId");
  if (!idInput) return;
  const id = idInput.value.trim();
  if (!id) return;

  const invWrapper = document.getElementById("invoiceContainer");

  try {
    const snap = await firebase.database().ref('orders/' + id).once('value');
    const data = snap.val();

    if (!data) {
      alert("Order ID not found!");
      if (invWrapper) invWrapper.style.display = "none";
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
  } catch (err) {
    alert(err.message);
  }
}

// Admin Panel Auth & Payout Table
function googleAdminLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then((res) => {
    if (authorizedAdminEmails.includes(res.user.email)) {
      document.getElementById("loginGate").style.display = "none";
      document.getElementById("adminPanel").style.display = "block";
      document.getElementById("currentAdminEmail").innerText = res.user.email;
      loadAdminOrders();
    } else {
      firebase.auth().signOut();
      document.getElementById("adminErrorMsg").innerText = "Unauthorized email!";
    }
  }).catch((err) => {
    document.getElementById("adminErrorMsg").innerText = err.message;
  });
}

function logoutAdmin() {
  firebase.auth().signOut().then(() => window.location.reload());
}

function loadAdminOrders() {
  const table = document.getElementById("ordersListTable");
  if (!table) return;

  firebase.database().ref('orders').on('value', (snap) => {
    table.innerHTML = "";
    const orders = snap.val();
    if (!orders) {
      table.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:#94a3b8;">No orders found.</td></tr>`;
      return;
    }

    Object.keys(orders).reverse().forEach((key) => {
      const o = orders[key];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${o.orderId}</strong></td>
        <td>${o.clientName}<br><small style="color:#94a3b8;">${o.clientEmail}</small></td>
        <td>${o.plan}</td>
        <td><code style="background:#07090e; padding:2px 5px; border-radius:4px; color:#38bdf8;">${o.utr}</code></td>
        <td>₹${o.amount}</td>
        <td>
          ${o.promoterStaff !== "NONE" ? `<span style="color:#10b981; font-weight:bold;">${o.promoterStaff}</span><br><small style="color:#f59e0b;">(Profit: ₹${o.staffProfit})</small>` : '<span style="color:#64748b;">Direct</span>'}
        </td>
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
