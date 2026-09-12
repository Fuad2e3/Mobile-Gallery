/* Mobile Gallery v1.0.0 - Production Protected Build. (c) 2026 Mobile Gallery Inc. All Rights Reserved. Reverse-engineering, redistribution or copying is prohibited. */
function stageTrack(order) {
  const stage = orderStage(order);
  if (stage === '\x43\x61\x6e\x63\x65\x6c\x6c\x65\x64' || stage === '\x43\x61\x6e\x63\x65\x6c') {
    return `
      <div class="track is-cancelled" role="alert">
        <span style="font-size:1.1rem">❌</span>
        <span>Order Cancelled</span>
      </div>`;
  }
  const at = ORDER_STAGES.indexOf(stage);
  return `
    <div class="track" role="img" aria-label="Status: ${esc(stage)}">
      ${ORDER_STAGES.map((name, i) => `
        <div class="\x74\x72\x61\x63\x6b\x5f\x5f\x73\x74\x65\x70\x20\x24\x7b\x69\x20\x3c\x3d\x20\x61\x74\x20\x3f\x20\x27\x69\x73\x2d\x64\x6f\x6e\x65\x27\x20\x3a\x20\x27\x27\x7d">
          <span class="\x74\x72\x61\x63\x6b\x5f\x5f\x64\x6f\x74">${i <= at ? icon('\x63\x68\x65\x63\x6b', 12, 3) : ''}</span>
          <small>${name}</small>
        </div>`).join('')}
    </div>`;
}
function orderCard(order) {
  const stage = orderStage(order);
  const stageClass = stage.toLowerCase();
  let linesMarkup = '';
  if (Array.isArray(order.lines) && order.lines.length) {
    linesMarkup = order.lines.map(l => `
      <div class="order__line">
        <span>${esc(l.qty || 1)} ×</span>
        <b>${esc(l.title || 'Product')}</b>
        <span class="order__lineprice">${money((l.price || 0) * (l.qty || 1))}</span>
      </div>`).join('');
  } else if (order.details) {
    const parts = String(order.details).split('\x3b').map(s => s.trim()).filter(Boolean);
    linesMarkup = parts.map(part => `
      <div class="order__line">
        <span style="color:var(--brand-600);font-weight:700">•</span>
        <b>${esc(part)}</b>
      </div>`).join('');
  }
  return `
    <article class="order" id="order-${esc(order.ref)}">
      <div class="order__head">
        <div>
          <b class="order__ref">${esc(order.ref)}</b>
          <small>${esc(orderDate(order.placedAt))}</small>
        </div>
        <span class="order__stage order__stage--${stageClass}">${esc(stage)}</span>
      </div>
      ${stageTrack(order)}
      <div class="order__lines">
        ${linesMarkup}
      </div>
      <div class="order__foot">
        <div>
          <small>Delivering to</small>
          <b>${esc(order.area || order.address || '')}, ${esc(order.city || 'Dhaka')}</b>
        </div>
        <div>
          <small>Payment</small>
          <b>${esc(order.payment || 'Cash on delivery')}</b>
        </div>
        <div>
          <small>Total</small>
          <b class="order__total">${money(order.total || 0)}</b>
        </div>
        <button class="btn btn--soft btn--sm" data-reorder="${esc(order.ref)}">Order again</button>
      </div>
    </article>`;
}
function paintOrders() {
  const box = document.getElementById('\x6f\x72\x64\x65\x72\x4c\x69\x73\x74');
  if (!box) return;
  let orders = getOrders();
  const user = window.SheetEndpoint ? window.SheetEndpoint.getCurrentUser() : null;
  if (user && user.email) {
    const userEmail = user.email.toLowerCase();
    const userPhone = (user.phone || '').trim();
    orders = orders.filter(o => {
      const oEmail = (o.email || '').toLowerCase();
      const oPhone = (o.phone || '').trim();
      return (oEmail && oEmail === userEmail) || (userPhone && oPhone && oPhone === userPhone);
    });
  }
  const countEl = document.getElementById('\x6f\x72\x64\x65\x72\x43\x6f\x75\x6e\x74');
  if (countEl) countEl.textContent = orders.length;
  const spendEl = document.getElementById('\x6f\x72\x64\x65\x72\x53\x70\x65\x6e\x64');
  if (spendEl) spendEl.textContent = money(orders.reduce((n, o) => n + (Number(o.total) || 0), 0));
  const statsEl = document.getElementById('\x6f\x72\x64\x65\x72\x53\x74\x61\x74\x73');
  if (statsEl) statsEl.hidden = !orders.length;
  if (!orders.length) {
    box.innerHTML = `
      <div class="empty">
        <h3>No orders yet</h3>
        <p>${user ? 'You have not placed any orders yet. Once placed, your orders will appear here with live Google Sheet status tracking.' : 'When you place an order it will appear here, with its live delivery progress.'}</p>
        <a class="btn btn--primary btn--sm" href="index.html#browse" style="margin-top:16px">Start shopping</a>
      </div>`;
    return;
  }
  box.innerHTML = orders.map(orderCard).join('');
}
async function syncOrdersFromSheet(showToast = false) {
  const badge = document.getElementById('\x6f\x72\x64\x65\x72\x53\x79\x6e\x63\x42\x61\x64\x67\x65');
  if (window.SheetEndpoint && window.SheetEndpoint.isReady()) {
    try {
      if (badge) badge.textContent = '\ud83d\udfe1\x20\x53\x79\x6e\x63\x69\x6e\x67\x2e\x2e\x2e';
      const sheetOrders = await window.SheetEndpoint.fetchOrders();
      if (badge) badge.textContent = '\ud83d\udfe2\x20\x4c\x69\x76\x65\x20\x53\x79\x6e\x63\x65\x64';
      paintOrders();
      if (showToast) toast('\x4f\x72\x64\x65\x72\x20\x73\x74\x61\x74\x75\x73\x20\x75\x70\x64\x61\x74\x65\x64\x20\x66\x72\x6f\x6d\x20\x47\x6f\x6f\x67\x6c\x65\x20\x53\x68\x65\x65\x74\x21', '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
      return sheetOrders;
    } catch (_) {
      if (badge) badge.textContent = '\u26aa\x20\x4c\x6f\x63\x61\x6c\x20\x43\x61\x63\x68\x65';
    }
  } else {
    if (badge) badge.textContent = '\u26aa\x20\x4c\x6f\x63\x61\x6c\x20\x43\x61\x63\x68\x65';
    paintOrders();
  }
}
async function initOrders() {
  const orderList = document.getElementById('\x6f\x72\x64\x65\x72\x4c\x69\x73\x74');
  if (!orderList) return;
  paintOrders();
  window.addEventListener('\x6d\x67\x3a\x61\x75\x74\x68\x2d\x63\x68\x61\x6e\x67\x65\x64', () => {
    paintOrders();
    syncOrdersFromSheet();
  });
  window.addEventListener('\x6d\x67\x3a\x6f\x72\x64\x65\x72\x73\x2d\x75\x70\x64\x61\x74\x65\x64', paintOrders);
  await syncOrdersFromSheet();
  const syncBtn = document.getElementById('\x73\x79\x6e\x63\x4f\x72\x64\x65\x72\x73\x42\x74\x6e');
  if (syncBtn) {
    syncBtn.addEventListener('\x63\x6c\x69\x63\x6b', async () => {
      syncBtn.disabled = true;
      syncBtn.textContent = '\x52\x65\x66\x72\x65\x73\x68\x69\x6e\x67\x2e\x2e\x2e';
      await syncOrdersFromSheet(true);
      syncBtn.disabled = false;
      syncBtn.textContent = '\ud83d\udd04\x20\x52\x65\x66\x72\x65\x73\x68\x20\x53\x74\x61\x74\x75\x73';
    });
  }
  window.addEventListener('\x66\x6f\x63\x75\x73', () => syncOrdersFromSheet());
  document.addEventListener('\x76\x69\x73\x69\x62\x69\x6c\x69\x74\x79\x63\x68\x61\x6e\x67\x65', () => {
    if (!document.hidden) syncOrdersFromSheet();
  });
  setInterval(() => {
    if (!document.hidden) syncOrdersFromSheet();
  }, 20000);
  orderList.addEventListener('\x63\x6c\x69\x63\x6b', e => {
    const again = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x72\x65\x6f\x72\x64\x65\x72\x5d');
    if (!again) return;
    const order = getOrders().find(o => o.ref === again.dataset.reorder);
    if (!order) return;
    let added = 0, skipped = 0;
    if (Array.isArray(order.lines)) {
      order.lines.forEach(l => {
        addToCart(l.id, l.qty) === '\x61\x64\x64\x65\x64' ? added++ : skipped++;
      });
    }
    if (!added) return toast('\x54\x68\x6f\x73\x65\x20\x70\x72\x6f\x64\x75\x63\x74\x73\x20\x61\x72\x65\x20\x6e\x6f\x20\x6c\x6f\x6e\x67\x65\x72\x20\x61\x76\x61\x69\x6c\x61\x62\x6c\x65', '\x63\x6c\x6f\x73\x65');
    toast(skipped ? `${added} added, ${skipped} unavailable` : '\x41\x64\x64\x65\x64\x20\x62\x61\x63\x6b\x20\x74\x6f\x20\x79\x6f\x75\x72\x20\x63\x61\x72\x74', '\x63\x61\x72\x74');
    openCart();
  });
}
document.addEventListener('\x44\x4f\x4d\x43\x6f\x6e\x74\x65\x6e\x74\x4c\x6f\x61\x64\x65\x64', initOrders);