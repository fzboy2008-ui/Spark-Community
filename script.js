// ==========================================
// 1. FIREBASE CONFIGURATION
// ==========================================
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

// ==========================================
// 2. CONSTANTS & SYSTEM DATA
// ==========================================
const availableFeatures = [
  "Welcome System", "Ticket System", "Store System", "Invite System",
  "Giveaway System", "Say System", "Goodbye System", "Auto Moderation",
  "Anti-Nuke", "Auto Response", "Server Stats", "VC Generator",
  "Staff Application System", "YouTube Upload Notifications",
  "Onboarding Buttons", "Nitro Emoji Converter", "Custom Bot Logo"
];

const validCoupons = [
  "spark-core-4341", "spark-core-4342", "spark-core-4343", "spark-core-4344",
  "spark-core-4345", "spark-core-4346", "spark-core-4347", "spark-core-4348",
  "spark-core-4349", "spark-core-4340"
];

const authorizedStaff = {
  "fzboy2008@gmail.com": "Fzboy786!",
  "dareque3n@gmail.com": "Fzboy786!"
};

let activeCheckout = {
  plan: '',
  details: '',
  rawPrice: 0,
  finalPrice: 0,
  appliedCoupon: "NONE"
};

// ==========================================
// 3. INITIALIZATION & NAV
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const featuresContainer = document.getElementById("featuresList");
  if (featuresContainer) {
    featuresContainer.innerHTML = "";
    availableFeatures.forEach((feat, index) => {
      const label = document.createElement("label");
      label.className = "feature-item-label";
      label.innerHTML = `
        <input type="checkbox" value="${feat}" onchange="recalculatePerFeature()">
        <span><strong>${index + 1}.</strong> ${feat} — <em>₹22.22/mo</em></span>
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

  const savedStaff = sessionStorage.getItem("spark_staff_email");
  if (savedStaff && authorizedStaff[savedStaff] && document.getElementById('loginGate')) {
    document.getElementById("loginGate").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("currentAdminEmail").innerText = savedStaff;
    loadAdminOrders();
  }
});

function toggleNav() {
  const drawer = document.getElementById('navDrawer');
  const backdrop = document.getElementById('navBackdrop');
  if (drawer && backdrop) {
    drawer.classList.toggle('active');
    backdrop.classList.toggle('active');
  }
}

// Category Tabs Switcher Function
function switchCategory(targetId, btnElement) {
  document.querySelectorAll('.category-content-panel').forEach(panel => {
    panel.classList.remove('active-panel');
  });
  
  document.querySelectorAll('.cat-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const target = document.getElementById(targetId);
  if (target) target.classList.add('active-panel');
  if (btnElement) btnElement.classList.add('active');
}

// ==========================================
// 4. PLAN SELECTIONS (UPDATED EXACT PRICES)
// ==========================================
function recalculatePerFeature() {
  const checked = document.querySelectorAll('#featuresList input[type="checkbox"]:checked');
  const count = checked.length;
  const itemsPrice = parseFloat((count * 22.22).toFixed(2));
  const setupPrice = count > 0 ? 50 : 0;
  const total = parseFloat((itemsPrice + setupPrice).toFixed(2));

  document.getElementById("selectedCount").innerText = count;
  document.getElementById("itemsPrice").innerText = itemsPrice;
  document.getElementById("setupPrice").innerText = setupPrice;
  document.getElementById("perFeatureTotal").innerText = total;
  document.getElementById("btnOrderFeatures").disabled = count === 0;
}

function checkoutFeatures() {
  const checkedInputs = Array.from(document.querySelectorAll('#featuresList input[type="checkbox"]:checked'));
  const selectedNames = checkedInputs.map(cb => cb.value);
  const count = selectedNames.length;
  const total = parseFloat(((count * 22.22) + 50).toFixed(2));

  openCheckoutModal("SparkCore Selected Features", selectedNames.join(", "), total);
}

function selectCorePlan(name, price) {
  openCheckoutModal(name, "Complete Features + Free Discord Setup", price);
}

function updateCustomTotal() {
  const selectElem = document.getElementById("customPanelSelect");
  if (!selectElem) return;
  const panel = parseInt(selectElem.value, 10);
  const total = parseFloat((555.56 + panel).toFixed(2));
  document.getElementById("customTotalDisplay").innerText = `Total: ₹${total}`;
}

function selectCustomPlan() {
  const selectElem = document.getElementById("customPanelSelect");
  const panel = selectElem ? parseInt(selectElem.value, 10) : 0;
  const panelText = panel === 300 ? "SparkCore 24/7 Hosting Panel (₹300/mo)" : "Self Hosted VPS (₹0)";
  const total = parseFloat((555.56 + panel).toFixed(2));
  openCheckoutModal("Custom Bot Creation", `Base: ₹555.56 | Hosting: ${panelText}`, total);
}

function openCheckoutModal(planName, details, price) {
  activeCheckout = {
    plan: planName,
    details: details,
    rawPrice: price,
    finalPrice: price,
    appliedCoupon: "NONE"
  };

  document.getElementById("mPlanName").innerText = planName;
  document.getElementById("mFinalPrice").innerText = price;

  const upiLink = `upi://pay?pa=6006283334@ptyes&pn=Fouzan%20Tariq&am=${price}&cu=INR&tn=SparkCore%20Payment`;
  const deepLink = document.getElementById("paytmDeepLink");
  if (deepLink) deepLink.setAttribute("href", upiLink);

  const couponInput = document.getElementById("couponInput");
  if (couponInput) couponInput.value = "";
  const couponMsg = document.getElementById("couponMsg");
  if (couponMsg) couponMsg.innerText = "";

  document.getElementById("checkoutModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("checkoutModal").style.display = "none";
}

function applyDiscountCoupon() {
  const code = document.getElementById("couponInput").value.trim().toLowerCase();
  const msg = document.getElementById("couponMsg");

  if (validCoupons.includes(code)) {
    const discount = parseFloat((activeCheckout.rawPrice * 0.10).toFixed(2));
    activeCheckout.finalPrice = parseFloat((activeCheckout.rawPrice - discount).toFixed(2));
    activeCheckout.appliedCoupon = code;

    document.getElementById("mFinalPrice").innerText = activeCheckout.finalPrice;

    const upiLink = `upi://pay?pa=6006283334@ptyes&pn=Fouzan%20Tariq&am=${activeCheckout.finalPrice}&cu=INR&tn=SparkCore%20Payment`;
    document.getElementById("paytmDeepLink").setAttribute("href", upiLink);

    msg.style.color = "#10b981";
    msg.innerText = `Success: 10% Discount Applied! (-₹${discount})`;
  } else {
    msg.style.color = "#ef4444";
    msg.innerText = "Invalid Coupon Code!";
  }
}

// ==========================================
// 5. ORDER SUBMISSION
// ==========================================
async function handleOrderSubmission(e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerText = "Submitting Order...";

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
    rawAmount: activeCheckout.rawPrice,
    amount: activeCheckout.finalPrice,
    utr: document.getElementById("utrCode").value.trim(),
    coupon: activeCheckout.appliedCoupon,
    status: "Processing",
    date: formattedDate,
    timestamp: now.toISOString()
  };

  try {
    await firebase.database().ref('orders/' + orderId).set(payload);
    alert(`Order Placed!\nOrder ID: ${orderId}\nUnder staff review.`);
    closeModal();
    window.location.href = `orders.html?id=${orderId}`;
  } catch (err) {
    alert("Error: " + err.message);
    submitBtn.disabled = false;
  }
}

// ==========================================
// 6. TRACK ORDER & INVOICE
// ==========================================
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
      alert("Order ID nahi mila!");
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
    document.getElementById("invItemPrice").innerText = data.rawAmount || data.amount;
    document.getElementById("invSubTotal").innerText = data.rawAmount || data.amount;
    document.getElementById("invFinalTotal").innerText = data.amount;

    const discountLine = document.getElementById("invDiscountLine");
    if (data.coupon && data.coupon !== "NONE") {
      discountLine.style.display = "block";
      const saved = (parseFloat(data.rawAmount || data.amount) - parseFloat(data.amount)).toFixed(2);
      document.getElementById("invDiscountVal").innerText = saved;
    } else {
      discountLine.style.display = "none";
    }

    const badge = document.getElementById("invStatusBadge");
    badge.innerText = data.status;
    badge.className = `badge-status badge-${data.status}`;
  } catch (err) {
    alert("Tracking Error: " + err.message);
  }
}

// ==========================================
// 7. STAFF LOGIN & MANAGEMENT
// ==========================================
function handleStaffEmailLogin(e) {
  e.preventDefault();
  const email = document.getElementById("adminEmailInput").value.trim().toLowerCase();
  const pass = document.getElementById("adminPassInput").value.trim();
  const errBox = document.getElementById("adminErrorMsg");

  if (authorizedStaff[email] && authorizedStaff[email] === pass) {
    sessionStorage.setItem("spark_staff_email", email);
    document.getElementById("loginGate").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("currentAdminEmail").innerText = email;
    loadAdminOrders();
  } else {
    errBox.innerText = "Access Denied: Invalid email or password.";
  }
}

function logoutAdmin() {
  sessionStorage.removeItem("spark_staff_email");
  window.location.reload();
}

function loadAdminOrders() {
  const table = document.getElementById("ordersListTable");
  if (!table) return;

  firebase.database().ref('orders').on('value', (snap) => {
    table.innerHTML = "";
    const orders = snap.val();
    if (!orders) {
      table.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:#94a3b8;">No orders available.</td></tr>`;
      return;
    }

    Object.keys(orders).reverse().forEach((key) => {
      const o = orders[key];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${o.orderId}</strong></td>
        <td>${o.clientName || 'Client'}<br><small style="color:#fda4af;">${o.clientEmail || ''}</small></td>
        <td>${o.plan || 'Custom Plan'}</td>
        <td><code style="background:#090204; padding:2px 6px; border-radius:4px; color:#ff4d64;">${o.utr || 'N/A'}</code></td>
        <td>₹${o.amount}</td>
        <td><small style="color:#f59e0b;">${o.coupon || 'NONE'}</small></td>
        <td><span class="badge-status badge-${o.status}">${o.status}</span></td>
        <td>
          <button class="btn-approve" onclick="updateOrderStatus('${o.orderId}', 'Approved')">Approve</button>
          <button class="btn-cancel" onclick="updateOrderStatus('${o.orderId}', 'Cancelled')">Cancel</button>
          <button class="btn-delete" onclick="deleteOrder('${o.orderId}')"><i class="fa-solid fa-trash"></i></button>
          <button class="btn-approve" style="background:#0284c7; margin-left:4px;" onclick="window.open('orders.html?id=${o.orderId}', '_blank')"><i class="fa-solid fa-file-invoice"></i></button>
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

function deleteOrder(id) {
  if (confirm(`Are you sure you want to delete order ${id}?`)) {
    firebase.database().ref('orders/' + id).remove().then(() => {
      alert(`Order ${id} deleted successfully!`);
    });
  }
}
