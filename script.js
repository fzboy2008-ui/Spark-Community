// ==========================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
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

// Plain browser compatibility initialize
if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// ==========================================
// 2. CONSTANTS & SYSTEM DATA
// ==========================================
const availableFeatures = [
  "Welcome System",
  "Ticket System",
  "Store System",
  "Invite System",
  "Giveaway System",
  "Say System",
  "Goodbye System",
  "Auto Moderation",
  "Anti-Nuke",
  "Auto Response",
  "Server Stats",
  "VC Generator",
  "Staff Application System",
  "YouTube Upload Notifications",
  "Onboarding Buttons",
  "Nitro Emoji Converter",
  "Custom Bot Logo"
];

// 5 Active Affiliate Referral Coupons (10% Discount)
const validCoupons = [
  "Sprk-731-petls",
  "Sprk-981-glxy",
  "Sprk-761-vortx",
  "Sprk-720-bloom",
  "Sprk-719-sprky"
];

// Admin Authorization List
const authorizedAdminEmails = [
  "fzboy2008@gmail.com",
  "fouzanwani2008@gmail.com"
];

// Active Checkout State
let activeCheckout = {
  plan: '',
  details: '',
  rawPrice: 0,
  finalPrice: 0,
  appliedCoupon: null
};

// ==========================================
// 3. PAGE INITIALIZATION (DOM LOAD)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Render 17 items inside plans.html
  const featuresContainer = document.getElementById("featuresList");
  if (featuresContainer) {
    featuresContainer.innerHTML = "";
    availableFeatures.forEach((feat, index) => {
      const label = document.createElement("label");
      label.className = "feature-item-label";
      label.innerHTML = `
        <input type="checkbox" value="${feat}" onchange="recalculatePerFeature()">
        <span><strong>${index + 1}.</strong> ${feat} — <em>₹20/mo</em></span>
      `;
      featuresContainer.appendChild(label);
    });
  }

  // Handle URL query string in orders.html (?id=SPK-XXXX)
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get('id');
  if (trackId && document.getElementById('searchOrderId')) {
    document.getElementById('searchOrderId').value = trackId;
    trackOrder();
  }

  // Check auth state persistence for admin panel
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

// ==========================================
// 4. PLAN CALCULATIONS & SELECTION
// ==========================================
function recalculatePerFeature() {
  const checked = document.querySelectorAll('#featuresList input[type="checkbox"]:checked');
  const count = checked.length;
  const itemsPrice = count * 20;
  const setupPrice = count > 0 ? 50 : 0;
  const total = itemsPrice + setupPrice;

  const countElem = document.getElementById("selectedCount");
  const itemsElem = document.getElementById("itemsPrice");
  const setupElem = document.getElementById("setupPrice");
  const totalElem = document.getElementById("perFeatureTotal");
  const orderBtn = document.getElementById("btnOrderFeatures");

  if (countElem) countElem.innerText = count;
  if (itemsElem) itemsElem.innerText = itemsPrice;
  if (setupElem) setupElem.innerText = setupPrice;
  if (totalElem) totalElem.innerText = total;
  if (orderBtn) orderBtn.disabled = count === 0;
}

function checkoutFeatures() {
  const checkedInputs = Array.from(document.querySelectorAll('#featuresList input[type="checkbox"]:checked'));
  const selectedNames = checkedInputs.map(cb => cb.value);
  const total = (selectedNames.length * 20) + 50;

  openCheckoutModal("Spark Bot (Per Feature Plan)", selectedNames.join(", "), total);
}

function selectCorePlan(name, price) {
  openCheckoutModal(name, "All 17+ Features Included + Free Discord Setup", price);
}

function updateCustomTotal() {
  const selectElem = document.getElementById("customPanelSelect");
  if (!selectElem) return;
  const panel = parseInt(selectElem.value, 10);
  const total = 500 + panel;
  document.getElementById("customTotalDisplay").innerText = `Total: ₹${total}`;
}

function selectCustomPlan() {
  const selectElem = document.getElementById("customPanelSelect");
  const panel = selectElem ? parseInt(selectElem.value, 10) : 0;
  const panelText = panel === 300 ? "Spark 24/7 Hosting Panel (₹300/mo)" : "Self Hosted VPS (₹0)";
  openCheckoutModal("Custom Bot Creation", `Base Creation: ₹500 | Hosting: ${panelText}`, 500 + panel);
}

// ==========================================
// 5. CHECKOUT MODAL & COUPON SYSTEM
// ==========================================
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
  
  const discountRow = document.getElementById("mDiscountRow");
  if (discountRow) discountRow.style.display = "none";
  
  const couponInput = document.getElementById("couponInput");
  if (couponInput) couponInput.value = "";
  
  const couponMsg = document.getElementById("couponMsg");
  if (couponMsg) couponMsg.innerText = "";

  document.getElementById("checkoutModal").style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.style.display = "none";
}

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
    feedback.innerText = "Invalid Coupon Code! Please check active staff codes.";
  }
}

// ==========================================
// 6. ORDER SUBMISSION (FIREBASE REALTIME DB)
// ==========================================
async function handleOrderSubmission(e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Processing...";
  }

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
    amount: activeCheckout.finalPrice,
    rawAmount: activeCheckout.rawPrice,
    utr: document.getElementById("utrCode").value.trim(),
    coupon: activeCheckout.appliedCoupon || "NONE",
    status: "Processing",
    date: formattedDate,
    timestamp: now.toISOString()
  };

  try {
    await firebase.database().ref('orders/' + orderId).set(payload);
    alert(`Order Placed Successfully!\n\nOrder ID: ${orderId}\nStatus: Processing\n\nApproval update will be processed under fzboy2008@gmail.com.`);
    closeModal();
    window.location.href = `orders.html?id=${orderId}`;
  } catch (error) {
    alert("Error saving order: " + error.message);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Order for Approval";
    }
  }
}

// ==========================================
// 7. ORDER TRACKER & INVOICE RENDER
// ==========================================
async function trackOrder() {
  const idInput = document.getElementById("searchOrderId");
  if (!idInput) return;
  const id = idInput.value.trim();
  if (!id) return;

  const invWrapper = document.getElementById("invoiceContainer");

  try {
    const snapshot = await firebase.database().ref('orders/' + id).once('value');
    const data = snapshot.val();

    if (!data) {
      alert("Order ID nahi mila! Kripya sahi Order ID check karein.");
      if (invWrapper) invWrapper.style.display = "none";
      return;
    }

    if (invWrapper) invWrapper.style.display = "block";

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
      const saved = (data.rawAmount || data.amount) - data.amount;
      document.getElementById("invDiscountVal").innerText = saved > 0 ? saved : Math.round(data.amount * 0.10);
    } else {
      discountLine.style.display = "none";
    }

    const badge = document.getElementById("invStatusBadge");
    badge.innerText = data.status;
    badge.className = `badge-status badge-${data.status}`;

    const instruction = document.getElementById("invInstructionBox");
    if (data.status === "Processing") {
      instruction.innerText = "Order verification pending under Admin (fzboy2008@gmail.com). UTR verify hote hi status Approved ho jayega.";
    } else if (data.status === "Approved") {
      instruction.innerText = "Order Approved! Aapka bot claim karne ke liye hamare Discord Server (https://discord.gg/h5ejJAabPv) par ticket open karein.";
    } else {
      instruction.innerText = "Order Cancelled. Kripya verification issue ke liye Discord server par staff se contact karein.";
    }
  } catch (err) {
    alert("Tracking error: " + err.message);
  }
}

// ==========================================
// 8. ADMIN GOOGLE AUTH & REAL-TIME DASHBOARD
// ==========================================
function googleAdminLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const errorElem = document.getElementById("adminErrorMsg");

  firebase.auth().signInWithPopup(provider)
    .then((res) => {
      const email = res.user.email;
      if (authorizedAdminEmails.includes(email)) {
        document.getElementById("loginGate").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        document.getElementById("currentAdminEmail").innerText = email;
        loadAdminOrders();
      } else {
        firebase.auth().signOut();
        if (errorElem) errorElem.innerText = `Unauthorized: ${email} ke pass staff access nahi hai.`;
      }
    })
    .catch((err) => {
      if (errorElem) errorElem.innerText = err.message;
    });
}

function logoutAdmin() {
  firebase.auth().signOut().then(() => {
    window.location.reload();
  });
}

function loadAdminOrders() {
  const table = document.getElementById("ordersListTable");
  if (!table) return;

  firebase.database().ref('orders').on('value', (snap) => {
    table.innerHTML = "";
    const orders = snap.val();
    if (!orders) {
      table.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:#94a3b8;">No orders received yet.</td></tr>`;
      return;
    }

    Object.keys(orders).reverse().forEach((key) => {
      const o = orders[key];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${o.orderId}</strong></td>
        <td>${o.clientName}<br><small style="color:#94a3b8;">${o.clientEmail}</small></td>
        <td>${o.plan}</td>
        <td><code style="background:#0c101c; padding:3px 6px; border-radius:4px; color:#38bdf8;">${o.utr}</code></td>
        <td>₹${o.amount}</td>
        <td><small style="color:#f59e0b;">${o.coupon}</small></td>
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
  firebase.database().ref('orders/' + id).update({
    status: newStatus
  }).then(() => {
    alert(`Order ${id} successfully updated to ${newStatus}!`);
  }).catch((err) => {
    alert("Update failed: " + err.message);
  });
}
  
