function timeAgo(ts) {
  if (!ts) return 'Recently';
  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function paintRecentPage() {
  const container = document.getElementById('recentGrid');
  const countBadge = document.getElementById('recentCount');
  const emptyBox = document.getElementById('recentEmpty');
  const contentBox = document.getElementById('recentContent');
  if (!container) return;

  const items = typeof getRecentDetailed === 'function' ? getRecentDetailed() : [];

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
    const isFav = typeof isFavorite === 'function' ? isFavorite(product.id) : false;
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

  const clearBtn = document.getElementById('clearRecentBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your recently viewed history?')) {
        if (typeof clearRecentHistory === 'function') clearRecentHistory();
        paintRecentPage();
        if (typeof toast === 'function') toast('Recently viewed history cleared', 'check');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initRecentPage);
