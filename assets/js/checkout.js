/* Mobile Gallery v1.0.0 - Production Protected Build. (c) 2026 Mobile Gallery Inc. All Rights Reserved. Reverse-engineering, redistribution or copying is prohibited. */
const PAYMENTS = [
  { id: '\x63\x6f\x64',    name: '\x43\x61\x73\x68\x20\x6f\x6e\x20\x64\x65\x6c\x69\x76\x65\x72\x79', note: '\x50\x61\x79\x20\x74\x68\x65\x20\x63\x6f\x75\x72\x69\x65\x72\x20\x77\x68\x65\x6e\x20\x69\x74\x20\x61\x72\x72\x69\x76\x65\x73', icon: '\x77\x61\x6c\x6c\x65\x74' },
  { id: '\x62\x6b\x61\x73\x68',  name: '\x62\x4b\x61\x73\x68',            note: '\x53\x65\x6e\x64\x20\x6d\x6f\x6e\x65\x79\x20\x74\x6f\x20\x6f\x75\x72\x20\x6d\x65\x72\x63\x68\x61\x6e\x74\x20\x6e\x75\x6d\x62\x65\x72', icon: '\x70\x68\x6f\x6e\x65' },
  { id: '\x6e\x61\x67\x61\x64',  name: '\x4e\x61\x67\x61\x64',            note: '\x49\x6e\x73\x74\x61\x6e\x74\x20\x6d\x6f\x62\x69\x6c\x65\x20\x70\x61\x79\x6d\x65\x6e\x74', icon: '\x70\x68\x6f\x6e\x65' },
  { id: '\x63\x61\x72\x64',   name: '\x43\x61\x72\x64',             note: '\x56\x69\x73\x61\x2c\x20\x4d\x61\x73\x74\x65\x72\x63\x61\x72\x64\x20\x6f\x72\x20\x41\x6d\x45\x78', icon: '\x77\x61\x6c\x6c\x65\x74' }
];
const ORDER_RULES = {
  name:    v => v.trim().length >= 3   || '\x45\x6e\x74\x65\x72\x20\x74\x68\x65\x20\x6e\x61\x6d\x65\x20\x66\x6f\x72\x20\x74\x68\x65\x20\x64\x65\x6c\x69\x76\x65\x72\x79\x2e',
  phone:   v => /^(?:\+?880|0)1[3-9]\d{8}$/.test(v.replace(/[\s-]/g, '')) || '\x55\x73\x65\x20\x61\x20\x76\x61\x6c\x69\x64\x20\x42\x61\x6e\x67\x6c\x61\x64\x65\x73\x68\x69\x20\x6e\x75\x6d\x62\x65\x72\x2c\x20\x65\x2e\x67\x2e\x20\x30\x31\x37\x31\x32\x33\x34\x35\x36\x37\x38\x2e',
  address: v => v.trim().length >= 10  || '\x45\x6e\x74\x65\x72\x20\x61\x20\x66\x75\x6c\x6c\x20\x61\x64\x64\x72\x65\x73\x73\x20\x74\x68\x65\x20\x63\x6f\x75\x72\x69\x65\x72\x20\x63\x61\x6e\x20\x66\x69\x6e\x64\x2e',
  area:    v => v.trim().length >= 2   || '\x57\x68\x69\x63\x68\x20\x61\x72\x65\x61\x20\x6f\x72\x20\x74\x68\x61\x6e\x61\x3f'
};
function validateOrderField(input) {
  const rule = ORDER_RULES[input.name];
  if (!rule) return true;
  const result = rule(input.value);
  const ok = result === true;
  const err = input.parentElement.querySelector('\x2e\x65\x72\x72');
  input.classList.toggle('\x69\x73\x2d\x62\x61\x64', !ok);
  if (err) {
    err.textContent = ok ? '' : result;
    err.classList.toggle('\x69\x73\x2d\x6f\x6e', !ok);
  }
  return ok;
}
function paintSummary() {
  const lines = cartDetailed();
  const box = document.getElementById('\x73\x75\x6d\x6d\x61\x72\x79');
  const place = document.getElementById('\x70\x6c\x61\x63\x65\x4f\x72\x64\x65\x72');
  if (!lines.length) {
    box.innerHTML = `
      <div class="cart-empty" style="padding:36px 10px">
        ${icon('cart', 34)}
        <h4>Your cart is empty</h4>
        <p>Add a product before checking out.</p>
        <a class="btn btn--soft btn--sm" href="index.html#browse">Browse products</a>
      </div>`;
    if (place) place.disabled = true;
    return;
  }
  const sub = cartSubtotal();
  const fee = deliveryFee(sub);
  box.innerHTML = `
    ${lines.map(({ qty, product }) => `
      <div class="\x73\x75\x6d\x6d\x61\x72\x79\x2d\x69\x74\x65\x6d">
        <span class="\x73\x75\x6d\x6d\x61\x72\x79\x2d\x69\x74\x65\x6d\x5f\x5f\x61\x72\x74">${deviceArt(product, 46)}</span>
        <span style="\x66\x6c\x65\x78\x3a\x31\x3b\x6d\x69\x6e\x2d\x77\x69\x64\x74\x68\x3a\x30">
          <b>${esc(product.title)}</b>
          <small>Qty ${qty} · ${esc(product.condition)}</small>
        </span>
        <b style="\x77\x68\x69\x74\x65\x2d\x73\x70\x61\x63\x65\x3a\x6e\x6f\x77\x72\x61\x70\x3b\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x2e\x38\x36\x72\x65\x6d">${money(product.price * qty)}</b>
      </div>`).join('')}
    <div style="margin-top:14px">
      <div class="summary-line"><span>Subtotal</span><b>${money(sub)}</b></div>
      <div class="summary-line">
        <span>Delivery</span>
        <b>${fee ? money(fee) : '<span style="color:var(--mint)">Free</span>'}</b>
      </div>
      <div class="summary-line" style="border-top:1px solid var(--line);margin-top:6px;padding-top:14px">
        <span style="font-weight:700;color:var(--text)">Total</span>
        <b style="font-size:1.3rem;letter-spacing:-.03em">${money(sub + fee)}</b>
      </div>
    </div>`;
  if (place) place.disabled = false;
}
function orderRef() {
  return '\x4d\x47\x2d' + Math.random().toString(36).slice(2, 8).toUpperCase();
}
function showConfirmation(order) {
  document.getElementById('\x63\x68\x65\x63\x6b\x6f\x75\x74\x4d\x61\x69\x6e').innerHTML = `
    <div class="order-done">
      <div class="order-done__tick">${icon('check', 38, 3)}</div>
      <h2>Order confirmed</h2>
      <p>Thanks ${esc(order.name.split(' ')[0])} — we have received your order and will call you
         on ${esc(order.phone)} to confirm delivery.</p>
      <div class="order-ref">${esc(order.ref)}</div>
      <p style="font-size:.9rem">
        <b>${esc(order.items)} item${order.items > 1 ? 's' : ''}</b> ·
        total <b>${money(order.total)}</b> ·
        paying by <b>${esc(order.payment)}</b>
      </p>
      <p style="font-size:.9rem;margin-top:6px">Delivering to ${esc(order.area)}, ${esc(order.city)} in 2-4 working days.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:28px">
        <a class="btn btn--primary" href="index.html#browse">Continue shopping</a>
        <button class="btn btn--ghost" onclick="window.print()">Print receipt</button>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: '\x73\x6d\x6f\x6f\x74\x68' });
}
function initCheckout() {
  const payBox = document.getElementById('\x70\x61\x79\x4f\x70\x74\x69\x6f\x6e\x73');
  if (!payBox) return;
  payBox.innerHTML = PAYMENTS.map((p, i) => `
    <label class="pay ${i === 0 ? 'is-on' : ''}">
      <input type="radio" name="payment" value="${p.id}" ${i === 0 ? 'checked' : ''}>
      <span style="color:var(--brand-600);display:flex">${icon(p.icon, 20)}</span>
      <span><b>${p.name}</b><small>${p.note}</small></span>
    </label>`).join('');
  payBox.addEventListener('\x63\x68\x61\x6e\x67\x65', () => {
    payBox.querySelectorAll('\x2e\x70\x61\x79').forEach(l =>
      l.classList.toggle('\x69\x73\x2d\x6f\x6e', l.querySelector('\x69\x6e\x70\x75\x74').checked));
  });
  const cityField = document.getElementById('\x63\x69\x74\x79\x46\x69\x65\x6c\x64');
  if (cityField) {
    cityField.innerHTML = CITIES.map(c => `<option>${esc(c)}</option>`).join('');
  }
  paintSummary();
  function syncCheckoutAuthGate() {
    const user = window.SheetEndpoint ? window.SheetEndpoint.getCurrentUser() : null;
    const gateBox = document.getElementById('\x63\x68\x65\x63\x6b\x6f\x75\x74\x41\x75\x74\x68\x47\x61\x74\x65');
    const userBanner = document.getElementById('\x63\x68\x65\x63\x6b\x6f\x75\x74\x55\x73\x65\x72\x42\x61\x6e\x6e\x65\x72');
    const placeBtn = document.getElementById('\x70\x6c\x61\x63\x65\x4f\x72\x64\x65\x72');
    if (user) {
      if (gateBox) gateBox.hidden = true;
      if (userBanner) {
        const initial = (user.name || '\x55\x73\x65\x72').charAt(0).toUpperCase();
        userBanner.hidden = false;
        userBanner.innerHTML = `
          <div class="checkout-user-banner__info">
            <span class="profile-avatar profile-avatar--lg">${initial}</span>
            <div style="min-width:0">
              <b>Logged in as ${esc(user.name)}</b>
              <small>${esc(user.email)} ${user.phone ? '· ' + esc(user.phone) : ''}</small>
            </div>
          </div>
          <button type="button" class="btn btn--soft btn--sm" id="checkoutSwitchBtn">Sign Out</button>
        `;
        const switchBtn = document.getElementById('\x63\x68\x65\x63\x6b\x6f\x75\x74\x53\x77\x69\x74\x63\x68\x42\x74\x6e');
        if (switchBtn) {
          switchBtn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
            if (window.SheetEndpoint) window.SheetEndpoint.logoutUser();
            if (window.paintUserAuthNav) window.paintUserAuthNav();
            syncCheckoutAuthGate();
            toast('\x59\x6f\x75\x20\x68\x61\x76\x65\x20\x73\x69\x67\x6e\x65\x64\x20\x6f\x75\x74', '\x63\x68\x65\x63\x6b');
          });
        }
      }
      const nameInput = document.getElementById('\x6f\x2d\x6e\x61\x6d\x65');
      const phoneInput = document.getElementById('\x6f\x2d\x70\x68\x6f\x6e\x65');
      const emailInput = document.getElementById('\x6f\x2d\x65\x6d\x61\x69\x6c');
      if (nameInput && !nameInput.value) nameInput.value = user.name || '';
      if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';
      if (emailInput && !emailInput.value) emailInput.value = user.email || '';
      if (placeBtn) {
        placeBtn.innerHTML = `Place order · ${money(cartTotal())}`;
        placeBtn.disabled = false;
      }
    } else {
      if (gateBox) gateBox.hidden = false;
      if (userBanner) userBanner.hidden = true;
      if (placeBtn) {
        placeBtn.innerHTML = `🔒 Create Account to Place Order`;
      }
    }
  }
  syncCheckoutAuthGate();
  window.addEventListener('\x6d\x67\x3a\x61\x75\x74\x68\x2d\x63\x68\x61\x6e\x67\x65\x64', syncCheckoutAuthGate);
  const gateRegBtn = document.getElementById('\x63\x68\x65\x63\x6b\x6f\x75\x74\x47\x61\x74\x65\x52\x65\x67\x42\x74\x6e');
  if (gateRegBtn) {
    gateRegBtn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      if (typeof openAuthModal === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') {
        openAuthModal('\x72\x65\x67\x69\x73\x74\x65\x72', '\x50\x6c\x65\x61\x73\x65\x20\x63\x72\x65\x61\x74\x65\x20\x61\x6e\x20\x61\x63\x63\x6f\x75\x6e\x74\x20\x74\x6f\x20\x63\x6f\x6d\x70\x6c\x65\x74\x65\x20\x79\x6f\x75\x72\x20\x70\x75\x72\x63\x68\x61\x73\x65\x2e');
      }
    });
  }
  const gateSignBtn = document.getElementById('\x63\x68\x65\x63\x6b\x6f\x75\x74\x47\x61\x74\x65\x53\x69\x67\x6e\x42\x74\x6e');
  if (gateSignBtn) {
    gateSignBtn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      if (typeof openAuthModal === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') {
        openAuthModal('\x73\x69\x67\x6e\x69\x6e', '\x50\x6c\x65\x61\x73\x65\x20\x73\x69\x67\x6e\x20\x69\x6e\x20\x74\x6f\x20\x63\x6f\x6d\x70\x6c\x65\x74\x65\x20\x79\x6f\x75\x72\x20\x70\x75\x72\x63\x68\x61\x73\x65\x2e');
      }
    });
  }
  const form = document.getElementById('\x6f\x72\x64\x65\x72\x46\x6f\x72\x6d');
  form.addEventListener('\x66\x6f\x63\x75\x73\x6f\x75\x74', e => {
    if (e.target.name && ORDER_RULES[e.target.name]) validateOrderField(e.target);
  });
  form.addEventListener('\x69\x6e\x70\x75\x74', e => {
    if (e.target.classList.contains('\x69\x73\x2d\x62\x61\x64')) validateOrderField(e.target);
  });
  form.addEventListener('\x73\x75\x62\x6d\x69\x74', async e => {
    e.preventDefault();
    const currentUser = window.SheetEndpoint ? window.SheetEndpoint.getCurrentUser() : null;
    if (!currentUser) {
      toast('\x50\x6c\x65\x61\x73\x65\x20\x63\x72\x65\x61\x74\x65\x20\x61\x6e\x20\x61\x63\x63\x6f\x75\x6e\x74\x20\x6f\x72\x20\x73\x69\x67\x6e\x20\x69\x6e\x20\x74\x6f\x20\x63\x6f\x6d\x70\x6c\x65\x74\x65\x20\x79\x6f\x75\x72\x20\x6f\x72\x64\x65\x72', '\x63\x6c\x6f\x73\x65');
      if (typeof openAuthModal === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') {
        openAuthModal('\x72\x65\x67\x69\x73\x74\x65\x72', '\x50\x6c\x65\x61\x73\x65\x20\x63\x72\x65\x61\x74\x65\x20\x61\x6e\x20\x61\x63\x63\x6f\x75\x6e\x74\x20\x74\x6f\x20\x70\x6c\x61\x63\x65\x20\x79\x6f\x75\x72\x20\x6f\x72\x64\x65\x72\x2e');
      }
      return;
    }
    const lines = cartDetailed();
    if (!lines.length) return toast('\x59\x6f\x75\x72\x20\x63\x61\x72\x74\x20\x69\x73\x20\x65\x6d\x70\x74\x79', '\x63\x6c\x6f\x73\x65');
    const fields = [...form.querySelectorAll('\x5b\x6e\x61\x6d\x65\x5d')].filter(el => ORDER_RULES[el.name]);
    const bad = fields.filter(el => !validateOrderField(el));
    if (bad.length) {
      bad[0].focus();
      bad[0].scrollIntoView({ behavior: '\x73\x6d\x6f\x6f\x74\x68', block: '\x63\x65\x6e\x74\x65\x72' });
      return toast(`${bad.length} field${bad.length > 1 ? 's need' : ' needs'} attention`, '\x63\x6c\x6f\x73\x65');
    }
    const placeBtn = document.getElementById('\x70\x6c\x61\x63\x65\x4f\x72\x64\x65\x72');
    if (placeBtn) {
      placeBtn.disabled = true;
      placeBtn.textContent = '\x50\x6c\x61\x63\x69\x6e\x67\x20\x6f\x72\x64\x65\x72\x20\x26\x20\x73\x79\x6e\x63\x69\x6e\x67\x2e\x2e\x2e';
    }
    const data = Object.fromEntries(new FormData(form));
    const payment = PAYMENTS.find(p => p.id === data.payment) || PAYMENTS[0];
    const order = {
      ref: orderRef(),
      name: data.name,
      phone: data.phone,
      email: data.email || currentUser.email || '',
      address: data.address,
      area: data.area,
      city: data.city,
      payment: payment.name,
      items: lines.reduce((n, l) => n + l.qty, 0),
      total: cartTotal(),
      lines: lines.map(l => ({ id: l.id, title: l.product.title, qty: l.qty, price: l.product.price })),
      placedAt: new Date().toISOString(),
      status: '\x50\x65\x6e\x64\x69\x6e\x67'
    };
    if (window.SheetEndpoint) {
      await window.SheetEndpoint.placeOrder(order);
    } else {
      const orders = readStore(ORDERS_KEY, []);
      orders.unshift(order);
      writeStore(ORDERS_KEY, orders);
    }
    if (typeof decrementLocalStock === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') {
      decrementLocalStock(order.lines);
    }
    clearCart();
    showConfirmation(order);
    toast('\x4f\x72\x64\x65\x72\x20\x70\x6c\x61\x63\x65\x64\x20\x73\x75\x63\x63\x65\x73\x73\x66\x75\x6c\x6c\x79\x21', '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
  });
}
document.addEventListener('\x44\x4f\x4d\x43\x6f\x6e\x74\x65\x6e\x74\x4c\x6f\x61\x64\x65\x64', initCheckout);