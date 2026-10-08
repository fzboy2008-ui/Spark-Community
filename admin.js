// Firebase configuration yahan add karein (Firebase Console -> Project Settings)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "spark-community.firebaseapp.com",
  databaseURL: "https://spark-community-default-rtdb.firebaseio.com",
  projectId: "spark-community"
};
firebase.initializeApp(firebaseConfig);

const allowedAdmins = [
  "fzboy2008@gmail.com",
  "fouzanwani2008@gmail.com"
];

function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const email = result.user.email;
      if (allowedAdmins.includes(email)) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        document.getElementById('adminEmailDisplay').innerText = email;
        loadOrders();
      } else {
        firebase.auth().signOut();
        document.getElementById('authError').innerText = "Access Denied: Aapka email authorized admin list me nahi hai.";
      }
    })
    .catch((error) => {
      document.getElementById('authError').innerText = error.message;
    });
}

function logoutAdmin() {
  firebase.auth().signOut().then(() => {
    location.reload();
  });
}

function loadOrders() {
  const tableBody = document.getElementById('ordersTableBody');
  firebase.database().ref('orders').on('value', (snapshot) => {
    tableBody.innerHTML = '';
    const orders = snapshot.val();
    if(!orders) return;

    Object.keys(orders).forEach((id) => {
      const item = orders[id];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.orderId}</td>
        <td>${item.clientName} (${item.clientEmail})</td>
        <td>${item.plan}</td>
        <td>₹${item.amount}</td>
        <td><code>${item.utr}</code></td>
        <td><span class="status-badge status-${item.status}">${item.status}</span></td>
        <td>
          <button class="approve-btn" onclick="updateStatus('${item.orderId}', 'Approved')">Approve</button>
          <button class="cancel-btn" onclick="updateStatus('${item.orderId}', 'Cancelled')">Cancel</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  });
}

function updateStatus(orderId, newStatus) {
  firebase.database().ref('orders/' + orderId).update({
    status: newStatus
  }).then(() => {
    alert(`Order ${orderId} marked as ${newStatus}!`);
  });
}
