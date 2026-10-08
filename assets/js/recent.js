/* Mobile Gallery v1.0.0 - Production Protected Build. (c) 2026 Mobile Gallery Inc. All Rights Reserved. Reverse-engineering, redistribution or copying is prohibited. */
function timeAgo(ts) {
  if (!ts) return '\x52\x65\x63\x65\x6e\x74\x6c\x79';
  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 5) return '\x4a\x75\x73\x74\x20\x6e\x6f\x77';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '\x59\x65\x73\x74\x65\x72\x64\x61\x79';
  return `${diffDays} days ago`;
}
function paintRecentPage() {
  const container = document.getElementById('\x72\x65\x63\x65\x6e\x74\x47\x72\x69\x64');
  const countBadge = document.getElementById('\x72\x65\x63\x65\x6e\x74\x43\x6f\x75\x6e\x74');
  const emptyBox = document.getElementById('\x72\x65\x63\x65\x6e\x74\x45\x6d\x70\x74\x79');
  const contentBox = document.getElementById('\x72\x65\x63\x65\x6e\x74\x43\x6f\x6e\x74\x65\x6e\x74');
  if (!container) return;
  const items = typeof getRecentDetailed === '\x66\x75\x6e\x63\x74\x69\x6f\x6e' ? getRecentDetailed() : [];
  if (countBadge) {
    countBadge.textContent = `${items.length} ${items.length === 1 ? 'device' : 'devices'}`;
  }
  if (!items || items.length === 0) {
    if (contentBox) contentBox.hidden = true;
    if (emptyBox) emptyBox.hidden = false;
    return;
  }
  if (emptyBox) emptyBox.hidden = true;
  if (contentBox) contentBox.hidden = false;
  container.innerHTML = items.map(({ product, ts }) => {
    const isFav = typeof isFavorite === '\x66\x75\x6e\x63\x74\x69\x6f\x6e' ? isFavorite(product.id) : false;
    const badgeText = timeAgo(ts);
    return `
      <div class="card" data-id="${esc(product.id)}">
        <div class="card__media">
          ${deviceArt(product, 180)}
          <button class="fav ${isFav ? 'is-on' : ''}" data-fav="${esc(product.id)}" aria-label="Add to wishlist" aria-pressed="${isFav}">
            ${icon('heart', 18)}
          </button>
          <span class="pill-badge" style="position:absolute;bottom:10px;left:10px;background:rgba(15,23,42,0.82);color:#fff;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);font-size:11px;padding:3px 9px">
            🕒 ${badgeText}
          </span>
        </div>
        <div class="card__body">
          <div class="card__meta">
            <span class="tag">${esc(product.condition)}</span>
            <span>${esc(product.brand)}</span>
          </div>
          <b class="card__title">${esc(product.title)}</b>
          <div class="card__price">
            <b>${money(product.price)}</b>
            ${product.oldPrice ? `<small>${money(product.oldPrice)}</small>` : ''}
          </div>
          <div class="card__actions">
            <button class="btn btn--primary btn--sm" data-add="${esc(product.id)}" style="flex:1">
              ${icon('cart', 16)} Add to Cart
            </button>
            <button class="btn btn--ghost btn--sm" data-open="${esc(product.id)}" title="View Details">
              ${icon('eye', 16)}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
function initRecentPage() {
  paintRecentPage();
  const clearBtn = document.getElementById('\x63\x6c\x65\x61\x72\x52\x65\x63\x65\x6e\x74\x42\x74\x6e');
  if (clearBtn) {
    clearBtn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      if (confirm('\x41\x72\x65\x20\x79\x6f\x75\x20\x73\x75\x72\x65\x20\x79\x6f\x75\x20\x77\x61\x6e\x74\x20\x74\x6f\x20\x63\x6c\x65\x61\x72\x20\x79\x6f\x75\x72\x20\x72\x65\x63\x65\x6e\x74\x6c\x79\x20\x76\x69\x65\x77\x65\x64\x20\x68\x69\x73\x74\x6f\x72\x79\x3f')) {
        if (typeof clearRecentHistory === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') clearRecentHistory();
        paintRecentPage();
        if (typeof toast === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') toast('\x52\x65\x63\x65\x6e\x74\x6c\x79\x20\x76\x69\x65\x77\x65\x64\x20\x68\x69\x73\x74\x6f\x72\x79\x20\x63\x6c\x65\x61\x72\x65\x64', '\x63\x68\x65\x63\x6b');
      }
    });
  }
}
document.addEventListener('\x44\x4f\x4d\x43\x6f\x6e\x74\x65\x6e\x74\x4c\x6f\x61\x64\x65\x64', initRecentPage);