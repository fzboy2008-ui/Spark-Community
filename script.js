// ==========================================
// 1. FIREBASE INITIALIZATION
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

let activeCheckout = { plan: '', details: '', rawPrice: 0, finalPrice: 0, appliedCoupon: "NONE" };

// ==========================================
// 3. PAGE INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Populate Features Picker Popup Modal
  const modalContainer = document.getElementById("modalFeaturesList");
  if (modalContainer) {
    modalContainer.innerHTML = "";
    availableFeatures.forEach((feat, index) => {
      const label = document.createElement("label");
      label.className = "feature-pop-item";
      label.innerHTML = `
        <input type="checkbox" value="${feat}" onchange="recalculateModalFeatures()">
        <span><strong>${index + 1}.</strong> ${feat} — <em>₹22.22/mo</em></span>
      `;
      modalContainer.appendChild(label);
    });
  }

  // Handle URL query string in orders.html
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get('id');
  if (trackId && document.getElementById('searchOrderId')) {
    document.getElementById('searchOrderId').value = trackId;
    trackOrder();
  }

  // Load Real Customer Reviews (if on home page)
  if (document.getElementById("reviewsContainer")) {
    loadCustomerReviews();
  }

  // Check Staff Session
  const savedStaff = sessionStorage.getItem("spark_staff_email");
  if (savedStaff && authorizedStaff[savedStaff] && document.getElementById('loginGate')) {
    document.getElementById("loginGate").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("currentAdminEmail").innerText = savedStaff;
    loadAdminOrders();
  }
});

// Category Tabs Switcher
function switchCategory(targetId, btnElement) {
  document.querySelectorAll('.category-content-panel').forEach(p => p.classList.remove('active-panel'));
  document.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById(targetId);
  if (target) target.classList.add('active-panel');
  if (btnElement) btnElement.classList.add('active');
}

// ==========================================
// 4. SELECTED FEATURES POPUP PICKER
// ==========================================
function openFeaturePickerModal() {
  document.getElementById("featurePickerModal").style.display = "flex";
}
function closeFeaturePickerModal() {
  document.getElementById("featurePickerModal").style.display = "none";
}

function recalculateModalFeatures() {
  const checked = document.querySelectorAll('#modalFeaturesList input[type="checkbox"]:checked');
  const count = checked.length;
  const itemsPrice = parseFloat((count * 22.22).toFixed(2));
  const setupPrice = count > 0 ? 50 : 0;
  const total = parseFloat((itemsPrice + setupPrice).toFixed(2));

  document.getElementById("popCount").innerText = count;
  document.getElementById("popTotal").innerText = `₹${total}`;
  document.getElementById("btnProceedFeatures").disabled = count === 0;
}

function proceedFromFeaturePicker() {
  const checked = Array.from(document.querySelectorAll('#modalFeaturesList input[type="checkbox"]:checked'));
  const names = checked.map(c => c.value);
  const total = parseFloat(((names.length * 22.22) + 50).toFixed(2));

  closeFeaturePickerModal();
  openCheckoutModal("Selected Features Plan", names.join(", "), total);
}

// ==========================================
// 5. PLAN PRICING & CHECKOUT
// ==========================================
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
  const panelText = panel === 300 ? "SparkCore Hosting (₹300/mo)" : "Self Hosted VPS (₹0)";
  const total = parseFloat((555.56 + panel).toFixed(2));
  openCheckoutModal("Custom Bot Creation", `Base: ₹555.56 | Hosting: ${panelText}`, total);
}

function openCheckoutModal(planName, details, price) {
  activeCheckout = { plan: planName, details: details, rawPrice: price, finalPrice: price, appliedCoupon: "NONE" };
  document.getElementById("mPlanName").innerText = planName;
  document.getElementById("mFinalPrice").innerText = price;

  // Direct Paytm UPI Deep-Link
  const paytmLink = `upi://pay?pa=6006283334@ptyes&pn=Fouzan%20Tariq&am=${price}&cu=INR&tn=SparkCore%20Payment`;
  document.getElementById("paytmDeepLink").setAttribute("href", paytmLink);

  const coupInput = document.getElementById("couponInput");
  if (coupInput) coupInput.value = "";
  const coupMsg = document.getElementById("couponMsg");
  if (coupMsg) coupMsg.innerText = "";

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

    const paytmLink = `upi://pay?pa=6006283334@ptyes&pn=Fouzan%20Tariq&am=${activeCheckout.finalPrice}&cu=INR&tn=SparkCore%20Payment`;
    document.getElementById("paytmDeepLink").setAttribute("href", paytmLink);

    msg.style.color = "#10b981";
    msg.innerText = `10% Discount Applied! (-₹${discount})`;
  } else {
    msg.style.color = "#ef4444";
    msg.innerText = "Invalid Coupon Code!";
  }
}

// ==========================================
// 6. ORDER SUBMISSION
// ==========================================
async function handleOrderSubmission(e) {
  e.preventDefault();
  const orderId = "SPK-" + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

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
    date: dateStr,
    timestamp: now.toISOString()
  };

  try {
    await firebase.database().ref('orders/' + orderId).set(payload);
    alert(`Order Placed Successfully!\nOrder ID: ${orderId}\nUnder review.`);
    closeModal();
    window.location.href = `orders.html?id=${orderId}`;
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// ==========================================
// 7. ORDER TRACKER
// ==========================================
async function trackOrder() {
  const id = document.getElementById("searchOrderId").value.trim();
  if (!id) return;
  const inv = document.getElementById("invoiceContainer");

  try {
    const snap = await firebase.database().ref('orders/' + id).once('value');
    const data = snap.val();
    if (!data) {
      alert("Order ID not found!");
      if (inv) inv.style.display = "none";
      return;
    }

    inv.style.display = "block";
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
// 8. REAL REVIEWS SYSTEM (APPROVED ONLY + LIKES)
// ==========================================
async function submitCustomerReview(e) {
  e.preventDefault();
  const orderId = document.getElementById("revOrderId").value.trim();
  const rating = parseInt(document.getElementById("revRating").value, 10);
  const comment = document.getElementById("revComment").value.trim();
  const statusMsg = document.getElementById("revStatusMsg");

  statusMsg.style.color = "#fda4af";
  statusMsg.innerText = "Checking Order Verification...";

  try {
    const snap = await firebase.database().ref('orders/' + orderId).once('value');
    const orderData = snap.val();

    if (!orderData) {
      statusMsg.style.color = "#ef4444";
      statusMsg.innerText = "Order ID nahi mila!";
      return;
    }

    if (orderData.status !== "Approved") {
      statusMsg.style.color = "#ef4444";
      statusMsg.innerText = `Order status is '${orderData.status}'. Sirf Approved customer review de sakte hain!`;
      return;
    }

    // Save review under /reviews/{orderId}
    const reviewPayload = {
      orderId: orderId,
      customerName: orderData.clientName,
      plan: orderData.plan,
      rating: rating,
      comment: comment,
      likes: 0,
      dislikes: 0,
      date: new Date().toLocaleDateString('en-GB')
    };

    await firebase.database().ref('reviews/' + orderId).set(reviewPayload);
    statusMsg.style.color = "#10b981";
    statusMsg.innerText = "Review submitted successfully!";
    document.getElementById("revComment").value = "";
  } catch (err) {
    statusMsg.style.color = "#ef4444";
    statusMsg.innerText = "Error: " + err.message;
  }
}

function loadCustomerReviews() {
  const container = document.getElementById("reviewsContainer");
  if (!container) return;

  firebase.database().ref('reviews').on('value', (snap) => {
    container.innerHTML = "";
    const reviews = snap.val();
    if (!reviews) {
      container.innerHTML = `<p style="color:#94a3b8; font-size:0.8rem; text-align:center;">Abhi tak koi review nahi aaya. Be the first verified customer to review!</p>`;
      return;
    }

    Object.keys(reviews).reverse().forEach(key => {
      const r = reviews[key];
      const stars = "⭐".repeat(r.rating);
      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <div class="review-card-header">
          <div>
            <strong style="color:#fff;">${r.customerName}</strong>
            <span class="review-badge-verified">Verified Buyer</span>
            <span style="color:#fda4af; font-size:0.75rem;">(${r.plan})</span>
          </div>
          <span style="color:#64748b; font-size:0.72rem;">${r.date}</span>
        </div>
        <div class="review-stars">${stars}</div>
        <p style="font-size:0.82rem; color:#fce7eb; margin:5px 0;">${r.comment}</p>
        <div class="review-actions">
          <button class="review-vote-btn" onclick="voteReview('${r.orderId}', 'likes')">
            <i class="fa-regular fa-thumbs-up"></i> <span>${r.likes || 0}</span>
          </button>
          <button class="review-vote-btn" onclick="voteReview('${r.orderId}', 'dislikes')">
            <i class="fa-regular fa-thumbs-down"></i> <span>${r.dislikes || 0}</span>
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  });
}

function voteReview(orderId, type) {
  const ref = firebase.database().ref(`reviews/${orderId}/${type}`);
  ref.transaction(current => (current || 0) + 1);
}

// ==========================================
// 9. STAFF AUTH & CONTROLS
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

  firebase.database().ref('orders').on('value', snap => {
    table.innerHTML = "";
    const orders = snap.val();
    if (!orders) {
      table.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#94a3b8;">No orders received yet.</td></tr>`;
      return;
    }

    Object.keys(orders).reverse().forEach(key => {
      const o = orders[key];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${o.orderId}</strong></td>
        <td>${o.clientName}<br><small style="color:#fda4af;">${o.clientEmail}</small></td>
        <td>${o.plan}</td>
        <td><code style="color:#ff2a44;">${o.utr}</code></td>
        <td>₹${o.amount}</td>
        <td><span class="badge-status badge-${o.status}">${o.status}</span></td>
        <td>
          <button class="btn" style="background:#10b981; color:#fff; padding:3px 6px; font-size:0.75rem;" onclick="updateOrderStatus('${o.orderId}', 'Approved')">Approve</button>
          <button class="btn" style="background:#ef4444; color:#fff; padding:3px 6px; font-size:0.75rem;" onclick="updateOrderStatus('${o.orderId}', 'Cancelled')">Cancel</button>
          <button class="btn" style="background:#64748b; color:#fff; padding:3px 6px; font-size:0.75rem;" onclick="deleteOrder('${o.orderId}')"><i class="fa-solid fa-trash"></i></button>
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
  if (confirm(`Delete order ${id}?`)) {
    firebase.database().ref('orders/' + id).remove().then(() => {
      alert(`Order ${id} deleted!`);
    });
  }
}
