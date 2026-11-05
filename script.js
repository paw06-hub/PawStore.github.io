// ============ CHECKOUT (trừ tiền + lưu lịch sử) ============
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) {
    return showToast('<i class="fas fa-exclamation-triangle"></i> Giỏ hàng trống!');
  }

  const user = getCurrentUser();
  if (!user) {
    showToast('<i class="fas fa-exclamation-triangle"></i> Vui lòng đăng nhập để thanh toán!');
    document.getElementById('cartModal').classList.remove('active');
    openAuthModal();
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (user.balance < total) {
    showToast('<i class="fas fa-times-circle"></i> Số dư không đủ! Hãy nạp thêm tiền.');
    return;
  }

  // Trừ tiền
  user.balance -= total;
  updateUser(user);

  // Lưu lịch sử mua
  const orders = getOrders();
  cart.forEach((item) => {
    orders.push({
      id: 'ord-' + Date.now() + '-' + item.id,
      userId: user.id,
      username: user.username,
      type: 'purchase',
      productName: item.name,
      productDesc: item.desc,
      quantity: item.quantity,
      amount: item.price * item.quantity,
      status: 'success',
      createdAt: Date.now(),
    });
  });
  saveOrders(orders);

  showToast(`<i class="fas fa-check-circle"></i> Thanh toán thành công ${total.toLocaleString('vi-VN')}đ!`);

  cart = [];
  saveCart();
  updateCartUI();
  renderCartItems();
  renderAuthUI();

  setTimeout(() => document.getElementById('cartModal').classList.remove('active'), 1200);
});
