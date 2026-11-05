/* =========================================================
   HỆ THỐNG TÀI KHOẢN - AUTH.JS
   - Đăng ký / Đăng nhập
   - Nạp tiền
   - Lịch sử mua & nạp
   - Quản lý users / orders trong localStorage
========================================================= */

const DB = {
  USERS: 'ks_users',
  ORDERS: 'ks_orders',
  SESSION: 'ks_session',
};

// ---------- Helpers localStorage ----------
function getUsers() { return JSON.parse(localStorage.getItem(DB.USERS)) || []; }
function saveUsers(users) { localStorage.setItem(DB.USERS, JSON.stringify(users)); }
function getOrders() { return JSON.parse(localStorage.getItem(DB.ORDERS)) || []; }
function saveOrders(orders) { localStorage.setItem(DB.ORDERS, JSON.stringify(orders)); }

function getSession() { return JSON.parse(localStorage.getItem(DB.SESSION)); }
function setSession(user) { localStorage.setItem(DB.SESSION, JSON.stringify(user)); }
function clearSession() { localStorage.removeItem(DB.SESSION); }

// ---------- Khởi tạo admin mặc định ----------
function initAdmin() {
  const users = getUsers();
  if (!users.find((u) => u.username === 'admin')) {
    users.push({
      id: 'admin-001',
      username: 'admin',
      email: 'admin@keystore.vn',
      password: 'admin123',
      role: 'admin',
      balance: 10000000,
      createdAt: Date.now(),
    });
    saveUsers(users);
    console.log('✅ Đã tạo tài khoản admin mặc định: admin / admin123');
  }
}
initAdmin();

// ---------- API ----------
function register(username, email, password) {
  const users = getUsers();
  if (users.find((u) => u.username === username)) {
    return { ok: false, msg: 'Tên đăng nhập đã tồn tại!' };
  }
  if (users.find((u) => u.email === email)) {
    return { ok: false, msg: 'Email đã được sử dụng!' };
  }
  const newUser = {
    id: 'user-' + Date.now(),
    username,
    email,
    password,
    role: 'user',
    balance: 0,
    createdAt: Date.now(),
  };
  users.push(newUser);
  saveUsers(users);
  return { ok: true, user: newUser };
}

function login(username, password) {
  const user = getUsers().find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return { ok: false, msg: 'Sai tên đăng nhập hoặc mật khẩu!' };
  setSession(user);
  return { ok: true, user };
}

function logout() {
  clearSession();
  renderAuthUI();
  showToast('<i class="fas fa-sign-out-alt"></i> Đã đăng xuất');
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  // Luôn lấy bản mới nhất từ DB để đồng bộ balance
  return getUsers().find((u) => u.id === session.id) || null;
}

function updateUser(updatedUser) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === updatedUser.id);
  if (idx === -1) return false;
  users[idx] = updatedUser;
  saveUsers(users);
  // Cập nhật session
  if (getSession() && getSession().id === updatedUser.id) {
    setSession(updatedUser);
  }
  return true;
}

// ---------- Nạp tiền ----------
function deposit(amount) {
  const user = getCurrentUser();
  if (!user) return { ok: false, msg: 'Bạn chưa đăng nhập!' };
  if (amount < 10000) return { ok: false, msg: 'Số tiền nạp tối thiểu 10.000đ' };

  user.balance += amount;
  updateUser(user);

  // Ghi log
  const orders = getOrders();
  orders.push({
    id: 'dep-' + Date.now(),
    userId: user.id,
    username: user.username,
    type: 'deposit',
    amount: amount,
    status: 'success',
    createdAt: Date.now(),
  });
  saveOrders(orders);

  return { ok: true, balance: user.balance };
}

// ---------- Lịch sử ----------
function getPurchaseHistory(userId) {
  return getOrders()
    .filter((o) => o.userId === userId && o.type === 'purchase')
    .sort((a, b) => b.createdAt - a.createdAt);
}

function getDepositHistory(userId) {
  return getOrders()
    .filter((o) => o.userId === userId && o.type === 'deposit')
    .sort((a, b) => b.createdAt - a.createdAt);
}

// ---------- UI ----------
function renderAuthUI() {
  const area = document.getElementById('authArea');
  const user = getCurrentUser();

  if (user) {
    area.innerHTML = `
      <div class="user-dropdown" id="openProfileBtn">
        <div class="mini-avatar"><i class="fas fa-user"></i></div>
        <div>
          <div class="u-name">${user.username}</div>
          <div class="u-balance">${user.balance.toLocaleString('vi-VN')}đ</div>
        </div>
      </div>
    `;
    document.getElementById('openProfileBtn').addEventListener('click', openProfile);
  } else {
    area.innerHTML = `<button class="login-btn" id="openLoginBtn">Đăng Nhập</button>`;
    document.getElementById('openLoginBtn').addEventListener('click', openAuthModal);
  }
}

// ---------- Mở/Đóng modals ----------
function openAuthModal() {
  document.getElementById('authModal').classList.add('active');
}
function closeAuthModal() {
  document.getElementById('authModal').classList.remove('active');
}

function openProfile() {
  const user = getCurrentUser();
  if (!user) return;

  document.getElementById('profileName').textContent = user.username;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileBalance').textContent =
    user.balance.toLocaleString('vi-VN') + 'đ';

  // Hiện nút Admin nếu có quyền
  const adminBtn = document.getElementById('adminPanelBtn');
  adminBtn.style.display = user.role === 'admin' ? 'flex' : 'none';

  document.getElementById('profileModal').classList.add('active');
}

// ---------- Hiển thị lịch sử ----------
function renderHistory(type) {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById('historyBody');
  const title = document.getElementById('historyTitle');

  const history =
    type === 'purchase' ? getPurchaseHistory(user.id) : getDepositHistory(user.id);

  title.textContent = type === 'purchase' ? 'Lịch Sử Mua Hàng' : 'Lịch Sử Nạp Tiền';

  if (history.length === 0) {
    body.innerHTML = `<p class="empty-history"><i class="fas fa-inbox"></i><br>Chưa có giao dịch nào</p>`;
    return;
  }

  body.innerHTML = history
    .map(
      (h) => `
    <div class="history-item">
      <div class="h-top">
        <span class="h-title">${h.type === 'purchase' ? h.productName : 'Nạp tiền'}</span>
        <span class="h-amount ${h.type === 'purchase' ? 'minus' : ''}">
          ${h.type === 'purchase' ? '-' : '+'}${h.amount.toLocaleString('vi-VN')}đ
        </span>
      </div>
      <div class="h-time">${new Date(h.createdAt).toLocaleString('vi-VN')}</div>
      ${h.productDesc ? `<div class="h-desc">${h.productDesc}</div>` : ''}
    </div>
  `
    )
    .join('');
}

// ---------- Event listeners ----------
document.addEventListener('DOMContentLoaded', () => {
  renderAuthUI();

  // Chuyển tab login/register
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.auth === 'login';
      document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
      document.getElementById('registerForm').classList.toggle('hidden', isLogin);
      document.getElementById('authTitle').textContent = isLogin ? 'Đăng Nhập' : 'Đăng Ký';
    });
  });

  document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.auth-tab[data-auth="register"]').click();
  });

  // Form đăng nhập
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    const res = login(u, p);
    if (res.ok) {
      showToast(`<i class="fas fa-check-circle"></i> Chào mừng ${res.user.username}!`);
      closeAuthModal();
      renderAuthUI();
      document.getElementById('loginForm').reset();
    } else {
      showToast(`<i class="fas fa-times-circle"></i> ${res.msg}`);
    }
  });

  // Form đăng ký
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('regUser').value.trim();
    const em = document.getElementById('regEmail').value.trim();
    const p = document.getElementById('regPass').value;
    const p2 = document.getElementById('regPass2').value;

    if (u.length < 3) return showToast('<i class="fas fa-times-circle"></i> Username tối thiểu 3 ký tự');
    if (p.length < 6) return showToast('<i class="fas fa-times-circle"></i> Mật khẩu tối thiểu 6 ký tự');
    if (p !== p2) return showToast('<i class="fas fa-times-circle"></i> Mật khẩu nhập lại không khớp');

    const res = register(u, em, p);
    if (res.ok) {
      showToast('<i class="fas fa-check-circle"></i> Đăng ký thành công! Hãy đăng nhập.');
      document.querySelector('.auth-tab[data-auth="login"]').click();
      document.getElementById('registerForm').reset();
      document.getElementById('loginUser').value = u;
    } else {
      showToast(`<i class="fas fa-times-circle"></i> ${res.msg}`);
    }
  });

  // Đóng modal auth
  document.getElementById('closeAuth').addEventListener('click', closeAuthModal);
  document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target.id === 'authModal') closeAuthModal();
  });

  // Profile
  document.getElementById('closeProfile').addEventListener('click', () => {
    document.getElementById('profileModal').classList.remove('active');
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    document.getElementById('profileModal').classList.remove('active');
  });

  // Nạp tiền
  document.getElementById('openDepositBtn').addEventListener('click', () => {
    document.getElementById('depositModal').classList.add('active');
  });
  document.getElementById('closeDeposit').addEventListener('click', () => {
    document.getElementById('depositModal').classList.remove('active');
  });

  document.querySelectorAll('.amount-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('depositAmount').value = btn.dataset.amount;
    });
  });

  document.getElementById('confirmDepositBtn').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('depositAmount').value);
    if (!amount || amount < 10000) {
      return showToast('<i class="fas fa-times-circle"></i> Số tiền không hợp lệ (tối thiểu 10.000đ)');
    }
    const res = deposit(amount);
    if (res.ok) {
      showToast(`<i class="fas fa-check-circle"></i> Nạp thành công ${amount.toLocaleString('vi-VN')}đ!`);
      document.getElementById('depositModal').classList.remove('active');
      document.getElementById('depositAmount').value = '';
      document.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('selected'));
      renderAuthUI();
      // Cập nhật profile nếu đang mở
      if (document.getElementById('profileModal').classList.contains('active')) {
        openProfile();
      }
    } else {
      showToast(`<i class="fas fa-times-circle"></i> ${res.msg}`);
    }
  });

  // Lịch sử
  document.getElementById('openHistoryBtn').addEventListener('click', () => {
    renderHistory('purchase');
    document.getElementById('historyModal').classList.add('active');
  });
  document.getElementById('openDepositHistoryBtn').addEventListener('click', () => {
    renderHistory('deposit');
    document.getElementById('historyModal').classList.add('active');
  });
  document.getElementById('closeHistory').addEventListener('click', () => {
    document.getElementById('historyModal').classList.remove('active');
  });
});
