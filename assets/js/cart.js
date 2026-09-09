/* Mobile Gallery v1.0.0 - Production Protected Build. (c) 2026 Mobile Gallery Inc. All Rights Reserved. Reverse-engineering, redistribution or copying is prohibited. */
function getCart() {
  const raw = readStore(CART_KEY, []);
  return Array.isArray(raw) ? raw.filter(l => l && l.id && l.qty > 0) : [];
}
function saveCart(lines) {
  writeStore(CART_KEY, lines);
  paintCartCount();
  if (document.getElementById('\x63\x61\x72\x74\x50\x61\x6e\x65\x6c')) renderCart();
}
function cartDetailed() {
  return getCart()
    .map(line => {
      const product = productById(line.id);
      return product ? { ...line, product } : null;
    })
    .filter(Boolean);
}
function cartCount() {
  return getCart().reduce((n, l) => n + l.qty, 0);
}
function cartSubtotal() {
  return cartDetailed().reduce((sum, l) => sum + l.product.price * l.qty, 0);
}
function deliveryFee(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_CHARGE;
}
function cartTotal() {
  const sub = cartSubtotal();
  return sub + deliveryFee(sub);
}
function addToCart(id, qty = 1) {
  const product = productById(id);
  if (!product) return '\x6d\x69\x73\x73\x69\x6e\x67';
  if (product.stock < 1) return '\x6f\x75\x74';
  const lines = getCart();
  const line = lines.find(l => l.id === id);
  const current = line ? line.qty : 0;
  if (current >= product.stock) return '\x6d\x61\x78';
  const next = Math.min(current + qty, product.stock);
  if (line) line.qty = next;
  else lines.push({ id, qty: next });
  saveCart(lines);
  return '\x61\x64\x64\x65\x64';
}
function setQty(id, qty) {
  const product = productById(id);
  const lines = getCart();
  const line = lines.find(l => l.id === id);
  if (!line || !product) return;
  line.qty = Math.max(0, Math.min(qty, product.stock));
  saveCart(lines.filter(l => l.qty > 0));
}
function removeFromCart(id) {
  saveCart(getCart().filter(l => l.id !== id));
}
function clearCart() {
  saveCart([]);
}
function paintCartCount() {
  const el = document.getElementById('\x63\x61\x72\x74\x43\x6f\x75\x6e\x74');
  if (!el) return;
  const n = cartCount();
  el.textContent = n > 99 ? '\x39\x39\x2b' : n;
  el.classList.toggle('\x69\x73\x2d\x6f\x6e', n > 0);
}
function renderCart() {
  const body = document.getElementById('\x63\x61\x72\x74\x42\x6f\x64\x79');
  const foot = document.getElementById('\x63\x61\x72\x74\x46\x6f\x6f\x74');
  if (!body) return;
  const lines = cartDetailed();
  if (!lines.length) {
    body.innerHTML = `
      <div class="cart-empty">
        ${icon('cart', 40)}
        <h4>Your cart is empty</h4>
        <p>Browse the catalogue and add something you like.</p>
        <button class="btn btn--soft btn--sm" data-cart-close>Continue shopping</button>
      </div>`;
    if (foot) foot.hidden = true;
    return;
  }
  body.innerHTML = lines.map(({ id, qty, product }) => `
    <div class="cart-line">
      <div class="cart-line__art">${deviceArt(product, 64)}</div>
      <div class="cart-line__info">
        <b>${esc(product.title)}</b>
        <small>${esc(product.brand)} · ${esc(product.condition)}</small>
        <div class="qty">
          <button data-qty-dec="${esc(id)}" aria-label="Reduce quantity">−</button>
          <span>${qty}</span>
          <button data-qty-inc="${esc(id)}" aria-label="Increase quantity"
            ${qty >= product.stock ? 'disabled title="No more in stock"' : ''}>+</button>
          <button class="cart-line__del" data-remove="${esc(id)}" aria-label="Remove from cart">
            ${icon('close', 15)}
          </button>
        </div>
      </div>
      <b class="cart-line__price">${money(product.price * qty)}</b>
    </div>`).join('');
  const sub = cartSubtotal();
  const fee = deliveryFee(sub);
  if (foot) {
    foot.hidden = false;
    foot.innerHTML = `
      <div class="cart-sum">
        <span>Subtotal</span><b>${money(sub)}</b>
      </div>
      <div class="cart-sum">
        <span>Delivery</span>
        <b>${fee ? money(fee) : '<span style="color:var(--mint)">Free</span>'}</b>
      </div>
      ${fee ? `<p class="\x63\x61\x72\x74\x2d\x6e\x75\x64\x67\x65">Add ${money(FREE_DELIVERY_OVER - sub)} more for free delivery.</p>` : ''}
      <div class="cart-sum cart-sum--total">
        <span>Total</span><b>${money(sub + fee)}</b>
      </div>
      <a class="btn btn--primary btn--block btn--lg" id="proceedCheckoutBtn" href="checkout.html">Proceed to checkout</a>
      <button class="btn btn--ghost btn--block btn--sm" data-cart-close>Continue shopping</button>`;
  }
}
function openCart() {
  const panel = document.getElementById('\x63\x61\x72\x74\x50\x61\x6e\x65\x6c');
  if (!panel) return;
  renderCart();
  panel.classList.add('\x69\x73\x2d\x6f\x70\x65\x6e');
  document.body.classList.add('\x6e\x6f\x2d\x73\x63\x72\x6f\x6c\x6c');
}
function closeCart() {
  const panel = document.getElementById('\x63\x61\x72\x74\x50\x61\x6e\x65\x6c');
  if (!panel) return;
  panel.classList.remove('\x69\x73\x2d\x6f\x70\x65\x6e');
  document.body.classList.remove('\x6e\x6f\x2d\x73\x63\x72\x6f\x6c\x6c');
}
function initCart() {
  paintCartCount();
  const openBtn = document.getElementById('\x63\x61\x72\x74\x42\x74\x6e');
  if (openBtn) openBtn.addEventListener('\x63\x6c\x69\x63\x6b', openCart);
  const panel = document.getElementById('\x63\x61\x72\x74\x50\x61\x6e\x65\x6c');
  if (!panel) return;
  panel.addEventListener('\x63\x6c\x69\x63\x6b', e => {
    const checkoutLink = e.target.closest('\x23\x70\x72\x6f\x63\x65\x65\x64\x43\x68\x65\x63\x6b\x6f\x75\x74\x42\x74\x6e\x2c\x20\x61\x5b\x68\x72\x65\x66\x3d\x22\x63\x68\x65\x63\x6b\x6f\x75\x74\x2e\x68\x74\x6d\x6c\x22\x5d');
    if (checkoutLink) {
      const user = window.SheetEndpoint ? window.SheetEndpoint.getCurrentUser() : null;
      if (!user) {
        e.preventDefault();
        closeCart();
        toast('\x50\x6c\x65\x61\x73\x65\x20\x63\x72\x65\x61\x74\x65\x20\x61\x6e\x20\x61\x63\x63\x6f\x75\x6e\x74\x20\x6f\x72\x20\x73\x69\x67\x6e\x20\x69\x6e\x20\x74\x6f\x20\x70\x72\x6f\x63\x65\x65\x64\x20\x74\x6f\x20\x63\x68\x65\x63\x6b\x6f\x75\x74', '\x75\x73\x65\x72\x73');
        if (typeof openAuthModal === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') {
          openAuthModal('\x72\x65\x67\x69\x73\x74\x65\x72', '\x50\x6c\x65\x61\x73\x65\x20\x63\x72\x65\x61\x74\x65\x20\x61\x6e\x20\x61\x63\x63\x6f\x75\x6e\x74\x20\x6f\x72\x20\x73\x69\x67\x6e\x20\x69\x6e\x20\x74\x6f\x20\x63\x6f\x6d\x70\x6c\x65\x74\x65\x20\x79\x6f\x75\x72\x20\x63\x68\x65\x63\x6b\x6f\x75\x74\x2e', () => {
            window.location.href = '\x63\x68\x65\x63\x6b\x6f\x75\x74\x2e\x68\x74\x6d\x6c';
          });
        }
        return;
      }
    }
    if (e.target === panel || e.target.closest('\x5b\x64\x61\x74\x61\x2d\x63\x61\x72\x74\x2d\x63\x6c\x6f\x73\x65\x5d')) return closeCart();
    const inc = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x71\x74\x79\x2d\x69\x6e\x63\x5d');
    const dec = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x71\x74\x79\x2d\x64\x65\x63\x5d');
    const rm  = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x72\x65\x6d\x6f\x76\x65\x5d');
    const line = id => getCart().find(l => l.id === id);
    if (inc) { const l = line(inc.dataset.qtyInc); if (l) setQty(l.id, l.qty + 1); }
    if (dec) { const l = line(dec.dataset.qtyDec); if (l) setQty(l.id, l.qty - 1); }
    if (rm)  { removeFromCart(rm.dataset.remove); toast('\x52\x65\x6d\x6f\x76\x65\x64\x20\x66\x72\x6f\x6d\x20\x63\x61\x72\x74', '\x63\x68\x65\x63\x6b'); }
  });
  document.addEventListener('\x6b\x65\x79\x64\x6f\x77\x6e', e => {
    if (e.key === '\x45\x73\x63\x61\x70\x65' && panel.classList.contains('\x69\x73\x2d\x6f\x70\x65\x6e')) closeCart();
  });
}
document.addEventListener('\x44\x4f\x4d\x43\x6f\x6e\x74\x65\x6e\x74\x4c\x6f\x61\x64\x65\x64', initCart);