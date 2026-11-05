/* =========================================================
   ADMIN PANEL - ADMIN.JS
========================================================= */

let adminTab = 'users';

function openAdminPanel() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    showToast('<i class="fas fa-ban"></i> Bạn không có quyền truy cập!');
    return;
  }
  document.getElementById('adminModal').classList.add('active');
  renderAdminTab('users');
}

function renderAdminTab(tab) {
  adminTab = tab;
  const body = document.getElementById('adminBody');

  if (tab === 'users') {
    const users = getUsers();
    body.innerHTML = `
      <div class="admin-stat-grid">
        <div class="admin-stat"><h3>${users.length}</h3><p>Tổng người dùng</p></div>
        <div class="admin-stat"><h3>${users.filter(u=>u.role==='admin').length}</h3><p>Admin</p></div>
        <div class="admin-stat"><h3>${users.reduce((s,u)=>s+u.balance,0).toLocaleString('vi-VN')}đ</h3><p>Tổng số dư</p></div>
      </div>
      <table class="admin-table">
        <thead><tr><th>Username</th><th>Email</th><th>Vai trò</th><th>Số dư</th><th>Ngày tạo</th></tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${u.username}</td>
              <td>${u.email}</td>
              <td><span class="badge-role ${u.role}">${u.role.toUpperCase()}</span></td>
              <td style="color:var(--gold);font-weight:700">${u.balance.toLocaleString('vi-VN')}đ</td>
              <td>${new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  if (tab === 'orders') {
    const orders = getOrders().sort((a,b) => b.createdAt - a.createdAt);
    const purchases = orders.filter(o => o.type === 'purchase');
    body.innerHTML = `
      <div class="admin-stat-grid">
        <div class="admin-stat"><h3>${purchases.length}</h3><p>Đơn mua</p></div>
        <div class="admin-stat"><h3>${orders.filter(o=>o.type==='deposit').length}</h3><p>Lượt nạp</p></div>
      </div>
      <table class="admin-table">
        <thead><tr><th>User</th><th>Loại</th><th>Sản phẩm / Nạp</th><th>Số tiền</th><th>Thời gian</th></tr></thead>
        <tbody>
          ${orders.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Chưa có đơn hàng</td></tr>' :
          orders.map(o => `
            <tr>
              <td>${o.username}</td>
              <td><span class="badge-role ${o.type==='purchase'?'user':'admin'}">${o.type==='purchase'?'MUA':'NẠP'}</span></td>
              <td>${o.productName || 'Nạp tiền'}</td>
              <td style="color:var(--gold);font-weight:700">${o.amount.toLocaleString('vi-VN')}đ</td>
              <td>${new Date(o.createdAt).toLocaleString('vi-VN')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  if (tab === 'revenue') {
    const orders = getOrders();
    const totalDeposit = orders.filter(o=>o.type==='deposit').reduce((s,o)=>s+o.amount,0);
    const totalRevenue = orders.filter(o=>o.type==='purchase').reduce((s,o)=>s+o.amount,0);
    const users = getUsers();
    body.innerHTML = `
      <div class="admin-stat-grid">
        <div class="admin-stat"><h3>${totalDeposit.toLocaleString('vi-VN')}đ</h3><p>Tổng nạp</p></div>
        <div class="admin-stat"><h3>${totalRevenue.toLocaleString('vi-VN')}đ</h3><p>Doanh thu</p></div>
        <div class="admin-stat"><h3>${users.length}</h3><p>Khách hàng</p></div>
      </div>
      <div style="padding:1rem;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:12px;text-align:center">
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:5px">Lợi nhuận ước tính (chênh lệch)</p>
        <h3 style="font-family:'Orbitron',sans-serif;color:var(--gold);font-size:1.8rem">
          ${(totalRevenue - totalDeposit).toLocaleString('vi-VN')}đ
        </h3>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Nút mở admin
  document.getElementById('adminPanelBtn')?.addEventListener('click', openAdminPanel);

  // Tabs admin
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderAdminTab(tab.dataset.admin);
    });
  });

  // Đóng modal admin
  document.getElementById('closeAdmin')?.addEventListener('click', () => {
    document.getElementById('adminModal').classList.remove('active');
  });
});
