let currentOrder = { plan: '', amount: 0 };

function calculatePerFeaturePrice() {
  const count = parseInt(document.getElementById('featureCount').value) || 1;
  const total = (count * 20) + 50; // 20/feature + 50 setup
  document.getElementById('perFeatureTotal').innerText = `Total: ₹${total} (₹${count * 20} + ₹50 setup)`;
}

function orderPerFeature() {
  const count = parseInt(document.getElementById('featureCount').value) || 1;
  const total = (count * 20) + 50;
  openOrderModal(`Spark Bot (${count} Features + Setup)`, total);
}

function calculateCustomPrice() {
  const hosting = parseInt(document.getElementById('hostingOption').value);
  const total = 500 + hosting;
  document.getElementById('customTotal').innerText = `Total: ₹${total} (${hosting === 300 ? '₹500 Creation + ₹300 Panel' : '₹500 Creation Only'})`;
}

function orderCustomBot() {
  const hosting = parseInt(document.getElementById('hostingOption').value);
  const total = 500 + hosting;
  const type = hosting === 300 ? "Custom Bot + Spark Panel (₹300/mo)" : "Custom Bot (Self Host)";
  openOrderModal(type, total);
}

function openOrderModal(plan, amount) {
  currentOrder = { plan, amount };
  document.getElementById('modalPlanName').innerText = plan;
  document.getElementById('modalAmount').innerText = `₹${amount}`;
  document.getElementById('selectedPlan').value = plan;
  document.getElementById('orderAmount').value = amount;
  document.getElementById('orderModal').style.display = 'flex';
}

function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
}

// User submits form
async function submitOrder(e) {
  e.preventDefault();
  const orderId = "SPK-" + Math.floor(100000 + Math.random() * 900000);
  
  const payload = {
    orderId: orderId,
    clientName: document.getElementById('clientName').value,
    clientEmail: document.getElementById('clientEmail').value,
    requirements: document.getElementById('botRequirements').value,
    plan: currentOrder.plan,
    amount: currentOrder.amount,
    utr: document.getElementById('utrNumber').value,
    status: 'Processing',
    timestamp: new Date().toISOString()
  };

  // Firebase Database me push karein
  await firebase.database().ref('orders/' + orderId).set(payload);

  // Email Notification Trigger via EmailJS ya Webhook/NodeJS
  // Is mail me Direct Approve/Cancel links jaate hain fzboy2008@gmail.com ko
  alert(`Order Created Successfully!\nOrder ID: ${orderId}\nStatus: Processing.\nApproval mail fzboy2008@gmail.com ko bhej di gayi hai.`);
  closeOrderModal();
  window.location.href = `track.html?id=${orderId}`;
}

// Tracking Status logic
async function checkOrderStatus() {
  const id = document.getElementById('trackOrderId').value.trim();
  if(!id) return;

  const snapshot = await firebase.database().ref('orders/' + id).once('value');
  const order = snapshot.val();

  const resDiv = document.getElementById('orderResult');
  if(!order) {
    alert("Order ID not found!");
    resDiv.style.display = 'none';
    return;
  }

  resDiv.style.display = 'block';
  document.getElementById('resOrderId').innerText = order.orderId;
  document.getElementById('resPlan').innerText = order.plan;
  document.getElementById('resAmount').innerText = order.amount;
  
  const badge = document.getElementById('resStatus');
  badge.innerText = order.status;
  badge.className = `status-badge status-${order.status}`;

  const note = document.getElementById('statusMessage');
  const invoiceBtn = document.getElementById('invoiceAction');

  if(order.status === 'Processing') {
    note.innerText = "Order verification pending under fzboy2008@gmail.com. Jaise hi UTR approve hoga status update ho jayega.";
    invoiceBtn.style.display = 'none';
  } else if(order.status === 'Approved') {
    note.innerText = "Order Approved! Aapka bot setup ho raha hai. Discord ticket create karein setup claim karne ke liye.";
    invoiceBtn.style.display = 'block';
  } else {
    note.innerText = "Order Cancelled. Kripya Discord server par ticket banayein clarification ke liye.";
    invoiceBtn.style.display = 'none';
  }
}
