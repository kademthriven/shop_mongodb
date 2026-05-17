const state = {
  products: [],
  activeUser: null,
  currentView: 'shop'
};

const views = {
  shop: document.querySelector('#shopView'),
  admin: document.querySelector('#adminView'),
  customer: document.querySelector('#customerView')
};

const viewTitles = {
  shop: 'Shop',
  admin: 'Admin',
  customer: 'Customer'
};

const productGrid = document.querySelector('#productGrid');
const adminProductList = document.querySelector('#adminProductList');
const productCount = document.querySelector('#productCount');
const adminProductCount = document.querySelector('#adminProductCount');
const cartList = document.querySelector('#cartList');
const cartCount = document.querySelector('#cartCount');
const ordersList = document.querySelector('#ordersList');
const userStatus = document.querySelector('#userStatus');
const activeUserCard = document.querySelector('#activeUserCard');
const toast = document.querySelector('#toast');

const productForm = document.querySelector('#productForm');
const userForm = document.querySelector('#userForm');
const fetchUserForm = document.querySelector('#fetchUserForm');

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast show ${type === 'error' ? 'error' : ''}`;

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.className = 'toast';
  }, 2800);
}

function money(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(number);
}

function productIdOf(product) {
  return product && (product._id || product.id || product.productId);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function findProduct(id) {
  return state.products.find((product) => String(productIdOf(product)) === String(id));
}

function setView(viewName) {
  state.currentView = viewName;

  Object.entries(views).forEach(([name, view]) => {
    view.classList.toggle('active-view', name === viewName);
  });

  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === viewName);
  });

  document.querySelector('#viewTitle').textContent = viewTitles[viewName];
}

function renderProducts() {
  const countText = `${state.products.length} ${state.products.length === 1 ? 'item' : 'items'}`;
  productCount.textContent = countText;
  adminProductCount.textContent = `${state.products.length} records`;

  if (!state.products.length) {
    productGrid.innerHTML = '<p class="empty-state">No products yet. Add your first product from the Admin tab.</p>';
    adminProductList.innerHTML = '<p class="empty-state">Inventory is empty.</p>';
    renderCart();
    return;
  }

  productGrid.innerHTML = state.products.map((product) => {
    const id = productIdOf(product);

    return `
      <article class="product-card">
        <header>
          <h4>${escapeHtml(product.title)}</h4>
          <span class="price">${money(product.price)}</span>
        </header>
        <p>${escapeHtml(product.description)}</p>
        <button class="primary-button" type="button" data-action="add-cart" data-id="${id}">Add to Cart</button>
      </article>
    `;
  }).join('');

  adminProductList.innerHTML = state.products.map((product) => {
    const id = productIdOf(product);

    return `
      <article class="admin-row">
        <header>
          <div>
            <h4>${escapeHtml(product.title)}</h4>
            <p>${money(product.price)} | ${escapeHtml(id)}</p>
          </div>
        </header>
        <p>${escapeHtml(product.description)}</p>
        <div class="row-actions">
          <button class="secondary-button" type="button" data-action="edit-product" data-id="${id}">Edit</button>
          <button class="danger-button" type="button" data-action="delete-product" data-id="${id}">Delete</button>
        </div>
      </article>
    `;
  }).join('');

  renderCart();
}

function renderUser() {
  if (!state.activeUser) {
    userStatus.textContent = 'Not loaded';
    activeUserCard.classList.add('empty');
    activeUserCard.innerHTML = `
      <strong>No user selected</strong>
      <span>Create or load a user to manage cart and orders.</span>
    `;
    renderCart();
    renderOrders([]);
    return;
  }

  userStatus.textContent = 'Loaded';
  activeUserCard.classList.remove('empty');
  activeUserCard.innerHTML = `
    <strong>${escapeHtml(state.activeUser.name)}</strong>
    <span>${escapeHtml(state.activeUser.email)}</span>
    <span>${escapeHtml(state.activeUser._id)}</span>
  `;

  document.querySelector('#activeUserId').value = state.activeUser._id;
  renderCart();
}

function cartItems() {
  return state.activeUser?.cart?.items || [];
}

function renderCart() {
  const items = cartItems();
  const totalQuantity = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  cartCount.textContent = `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`;

  if (!state.activeUser) {
    cartList.innerHTML = '<p class="empty-state">Load a user to view cart items.</p>';
    document.querySelector('#placeOrderBtn').disabled = true;
    return;
  }

  if (!items.length) {
    cartList.innerHTML = '<p class="empty-state">Cart is empty.</p>';
    document.querySelector('#placeOrderBtn').disabled = true;
    return;
  }

  document.querySelector('#placeOrderBtn').disabled = false;
  cartList.innerHTML = items.map((item) => {
    const productId = String(item.productId);
    const product = findProduct(productId);
    const title = product ? product.title : 'Unknown product';
    const price = product ? money(product.price) : 'Price unavailable';

    return `
      <article class="cart-row">
        <header>
          <div>
            <h4>${escapeHtml(title)}</h4>
            <p>${escapeHtml(productId)}</p>
          </div>
          <span class="status-pill">Qty ${item.quantity}</span>
        </header>
        <p>${price}</p>
        <button class="danger-button" type="button" data-action="remove-cart" data-id="${productId}">Remove</button>
      </article>
    `;
  }).join('');
}

function renderOrders(orders = []) {
  if (!state.activeUser) {
    ordersList.innerHTML = '<p class="empty-state">Load a user to view orders.</p>';
    return;
  }

  if (!orders.length) {
    ordersList.innerHTML = '<p class="empty-state">No orders found for this user.</p>';
    return;
  }

  ordersList.innerHTML = orders.map((order) => {
    const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown date';
    const items = order.items || [];

    return `
      <article class="order-card">
        <header>
          <h4>Order ${escapeHtml(order._id)}</h4>
          <span class="status-pill">${items.length} ${items.length === 1 ? 'line' : 'lines'}</span>
        </header>
        <p>${escapeHtml(createdAt)}</p>
        <ul class="order-items">
          ${items.map((item) => {
            const productId = String(item.productId);
            const product = findProduct(productId);
            return `
              <li>
                <span>${escapeHtml(product ? product.title : productId)}</span>
                <strong>Qty ${item.quantity}</strong>
              </li>
            `;
          }).join('')}
        </ul>
      </article>
    `;
  }).join('');
}

function resetProductForm() {
  productForm.reset();
  document.querySelector('#productId').value = '';
  document.querySelector('#saveProductBtn').textContent = 'Create Product';
}

function editProduct(id) {
  const product = findProduct(id);
  if (!product) {
    showToast('Product not found', 'error');
    return;
  }

  document.querySelector('#productId').value = productIdOf(product);
  document.querySelector('#productTitle').value = product.title || '';
  document.querySelector('#productPrice').value = product.price || '';
  document.querySelector('#productDescription').value = product.description || '';
  document.querySelector('#saveProductBtn').textContent = 'Update Product';
  setView('admin');
}

async function loadProducts() {
  const data = await api('/products');
  state.products = data.products || [];
  renderProducts();
}

async function loadUser(userId) {
  const data = await api(`/users/${encodeURIComponent(userId)}`);

  if (!data.user) {
    throw new Error('User not found');
  }

  state.activeUser = data.user;
  renderUser();
  await loadOrders();
}

async function loadOrders() {
  if (!state.activeUser) {
    renderOrders([]);
    return;
  }

  const data = await api(`/orders/${encodeURIComponent(state.activeUser._id)}`);
  renderOrders(data.orders || []);
}

document.querySelectorAll('.nav-tab').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

document.querySelector('#refreshProductsBtn').addEventListener('click', async () => {
  try {
    await loadProducts();
    showToast('Products refreshed');
  } catch (error) {
    showToast(error.message, 'error');
  }
});

document.querySelector('#resetProductFormBtn').addEventListener('click', resetProductForm);

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(productForm);
  const id = formData.get('productId');
  const payload = {
    title: formData.get('title').trim(),
    price: Number(formData.get('price')),
    description: formData.get('description').trim()
  };

  try {
    if (id) {
      await api(`/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Product updated');
    } else {
      await api('/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Product created');
    }

    resetProductForm();
    await loadProducts();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

userForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(userForm);
  const payload = {
    name: formData.get('name').trim(),
    email: formData.get('email').trim()
  };

  try {
    const data = await api('/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    userForm.reset();
    await loadUser(data.userId);
    setView('customer');
    showToast('User created and loaded');
  } catch (error) {
    showToast(error.message, 'error');
  }
});

fetchUserForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userId = new FormData(fetchUserForm).get('userId').trim();
  if (!userId) {
    showToast('Enter a user id', 'error');
    return;
  }

  try {
    await loadUser(userId);
    showToast('User loaded');
  } catch (error) {
    showToast(error.message, 'error');
  }
});

document.body.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;

  try {
    if (action === 'edit-product') {
      editProduct(id);
    }

    if (action === 'delete-product') {
      await api(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await loadProducts();
      showToast('Product deleted');
    }

    if (action === 'add-cart') {
      if (!state.activeUser) {
        setView('customer');
        showToast('Load or create a user first', 'error');
        return;
      }

      await api('/cart', {
        method: 'POST',
        body: JSON.stringify({
          userId: state.activeUser._id,
          productId: id
        })
      });

      await loadUser(state.activeUser._id);
      setView('customer');
      showToast('Added to cart');
    }

    if (action === 'remove-cart') {
      await api('/cart', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: state.activeUser._id,
          productId: id
        })
      });

      await loadUser(state.activeUser._id);
      showToast('Removed from cart');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
});

document.querySelector('#placeOrderBtn').addEventListener('click', async () => {
  if (!state.activeUser) {
    showToast('Load a user first', 'error');
    return;
  }

  try {
    await api('/orders', {
      method: 'POST',
      body: JSON.stringify({ userId: state.activeUser._id })
    });

    await loadUser(state.activeUser._id);
    showToast('Order placed');
  } catch (error) {
    showToast(error.message, 'error');
  }
});

document.querySelector('#refreshOrdersBtn').addEventListener('click', async () => {
  try {
    await loadOrders();
    showToast('Orders refreshed');
  } catch (error) {
    showToast(error.message, 'error');
  }
});

renderUser();
loadProducts().catch((error) => showToast(error.message, 'error'));
