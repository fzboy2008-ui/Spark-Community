<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Dashboard | Spark Community</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div class="container admin-container">
    <div id="loginGate">
      <div class="login-card">
        <div class="logo">⚡ Spark <span>Admin</span></div>
        <p>Restricted access for verified staff accounts only.</p>
        <button class="btn primary-btn full-w" onclick="googleAdminLogin()">
          <i class="fa-brands fa-google"></i> Sign in with Google
        </button>
        <p id="adminErrorMsg" class="error-text"></p>
      </div>
    </div>

    <div id="adminPanel" style="display:none;">
      <div class="admin-topbar">
        <h2>Spark Staff Control Panel</h2>
        <div>
          <span id="currentAdminEmail"></span>
          <button class="btn secondary-btn" onclick="logoutAdmin()">Logout</button>
        </div>
      </div>

      <h3>Recent Client Orders</h3>
      <div class="table-responsive">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Plan</th>
              <th>UTR</th>
              <th>Amount</th>
              <th>Coupon</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="ordersListTable">
            <!-- Dynamic Realtime Orders -->
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
  <script src="script.js"></script>
</body>
</html>
  
