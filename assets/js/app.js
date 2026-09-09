/* Mobile Gallery v1.0.0 - Production Protected Build. (c) 2026 Mobile Gallery Inc. All Rights Reserved. Reverse-engineering, redistribution or copying is prohibited. */
const state = {
  q: '',
  category: '\x61\x6c\x6c',
  brands: new Set(),
  conditions: new Set(),
  inStock: false,
  onSale: false,
  maxPrice: 200000,
  sort: '\x72\x65\x6c\x65\x76\x61\x6e\x74',
  view: '\x67\x72\x69\x64',
  favOnly: false,
  page: 1,
  perPage: 12
};
const PRICE_CEIL = 200000;
function badgeMarkup(item) {
  const out = [];
  if (item.tags.includes('\x68\x6f\x74'))      out.push('\x3c\x73\x70\x61\x6e\x20\x63\x6c\x61\x73\x73\x3d\x22\x62\x61\x64\x67\x65\x20\x62\x61\x64\x67\x65\x2d\x2d\x68\x6f\x74\x22\x3e\ud83d\udd25\x20\x54\x72\x65\x6e\x64\x69\x6e\x67\x3c\x2f\x73\x70\x61\x6e\x3e');
  if (item.tags.includes('\x6e\x65\x77'))      out.push('\x3c\x73\x70\x61\x6e\x20\x63\x6c\x61\x73\x73\x3d\x22\x62\x61\x64\x67\x65\x20\x62\x61\x64\x67\x65\x2d\x2d\x6e\x65\x77\x22\x3e\x42\x72\x61\x6e\x64\x20\x6e\x65\x77\x3c\x2f\x73\x70\x61\x6e\x3e');
  if (item.tags.includes('\x6f\x66\x66\x69\x63\x69\x61\x6c')) out.push('\x3c\x73\x70\x61\x6e\x20\x63\x6c\x61\x73\x73\x3d\x22\x62\x61\x64\x67\x65\x20\x62\x61\x64\x67\x65\x2d\x2d\x6f\x66\x66\x69\x22\x3e\x4f\x66\x66\x69\x63\x69\x61\x6c\x20\x77\x61\x72\x72\x61\x6e\x74\x79\x3c\x2f\x73\x70\x61\x6e\x3e');
  const off = discount(item);
  if (off >= 12 && !item.tags.includes('\x6e\x65\x77')) out.push(`<span class="badge badge--deal">-${off}% off</span>`);
  return out.length ? `<div class="badges">${out.slice(0, 2).join('')}</div>` : '';
}
function cardMarkup(item) {
  const off = discount(item);
  return `
  <article class="card reveal" data-id="${esc(item.id)}">
    <div class="card__media">
      ${badgeMarkup(item)}
      <button class="fav ${isFav(item.id) ? 'is-on' : ''}" data-fav="${esc(item.id)}"
              aria-label="Save ${esc(item.title)} to favourites" aria-pressed="${isFav(item.id)}">
        ${icon('heart', 18)}
      </button>
      ${deviceArt(item, 168)}
    </div>
    <div class="card__body">
      <span class="card__brand">${esc(item.brand)} · ${esc(item.condition)}</span>
      <h3 class="card__title"><a href="#" data-open="${esc(item.id)}">${esc(item.title)}</a></h3>
      <div class="card__meta">
        ${item.storage !== 'N/A' ? `<span>${esc(item.storage)}</span>` : ''}
        ${item.ram !== 'N/A' ? `<span>${esc(item.ram)} RAM</span>` : ''}
        ${item.battery !== 'N/A' ? `<span>${esc(item.battery)}</span>` : ''}
      </div>
      <div class="card__price">
        <b>${money(item.price)}</b>
        ${off ? `<del>${money(item.oldPrice)}</del><span class="off">-${off}%</span>` : ''}
      </div>
      <div class="card__rating">
        ${starRow(item.rating)}
        <span>${esc(item.rating)} <small>(${esc(item.reviews)})</small></span>
        ${stockLabel(item)}
      </div>
      <div class="card__foot">
        <button class="btn btn--primary btn--sm btn--block" data-add="${esc(item.id)}"
          ${item.stock < 1 ? 'disabled' : ''}>
          ${icon('cart', 16)} ${item.stock < 1 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </div>
  </article>`;
}
function skeletonMarkup(n = 8) {
  return Array.from({ length: n }, () => `
    <article class="card card--skeleton">
      <div class="card__media"><div class="sk" style="width:100%;height:100%"></div></div>
      <div class="card__body">
        <div class="sk" style="width:38%;height:10px"></div>
        <div class="sk" style="width:88%;height:16px"></div>
        <div class="sk" style="width:60%;height:12px"></div>
        <div class="sk" style="width:44%;height:22px;margin-top:8px"></div>
      </div>
    </article>`).join('');
}
function matches(item) {
  if (state.favOnly && !isFav(item.id)) return false;
  if (state.category !== '\x61\x6c\x6c' && item.category !== state.category) return false;
  if (state.brands.size && !state.brands.has(item.brand)) return false;
  if (state.conditions.size && !state.conditions.has(item.condition)) return false;
  if (state.inStock && item.stock < 1) return false;
  if (state.onSale && discount(item) <= 0) return false;
  if (item.price > state.maxPrice) return false;
  if (state.q) {
    const hay = `${item.title} ${item.brand} ${item.category} ${item.chip} ${item.storage} ${item.condition} ${item.desc}`.toLowerCase();
    if (!state.q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w))) return false;
  }
  return true;
}
const SORTERS = {
  relevant:  (a, b) => (b.tags.length - a.tags.length) || (b.views - a.views),
  '\x70\x72\x69\x63\x65\x2d\x61': (a, b) => a.price - b.price,
  '\x70\x72\x69\x63\x65\x2d\x64': (a, b) => b.price - a.price,
  newest:    (a, b) => a.added - b.added,
  popular:   (a, b) => b.views - a.views,
  discount:  (a, b) => discount(b) - discount(a)
};
function filtered() {
  return allProducts().filter(matches).sort(SORTERS[state.sort] || SORTERS.relevant);
}
function paintResults() {
  const grid = document.getElementById('\x67\x72\x69\x64');
  if (!grid) return;
  const results = filtered();
  const shown = results.slice(0, state.page * state.perPage);
  const countEl = document.getElementById('\x72\x65\x73\x75\x6c\x74\x43\x6f\x75\x6e\x74');
  if (countEl) countEl.textContent = results.length;
  grid.classList.toggle('\x69\x73\x2d\x6c\x69\x73\x74', state.view === '\x6c\x69\x73\x74');
  if (!results.length) {
    grid.innerHTML = `
      <div class="empty">
        <h3>No ads match those filters</h3>
        <p>Try widening the price range or clearing a brand or two.</p>
        <button class="btn btn--soft btn--sm" id="emptyReset" style="margin-top:16px">Reset all filters</button>
      </div>`;
    const emptyReset = document.getElementById('\x65\x6d\x70\x74\x79\x52\x65\x73\x65\x74');
    if (emptyReset) emptyReset.addEventListener('\x63\x6c\x69\x63\x6b', resetFilters);
  } else {
    grid.innerHTML = shown.map(cardMarkup).join('');
    requestAnimationFrame(() => grid.querySelectorAll('\x2e\x72\x65\x76\x65\x61\x6c').forEach((el, i) => {
      setTimeout(() => el.classList.add('\x69\x73\x2d\x69\x6e'), Math.min(i, 8) * 45);
    }));
  }
  const more = document.getElementById('\x6c\x6f\x61\x64\x4d\x6f\x72\x65');
  if (more) {
    const remaining = results.length - shown.length;
    more.hidden = remaining <= 0;
    more.textContent = `Show ${Math.min(remaining, state.perPage)} more ads`;
  }
  paintActiveChips();
}
function paintActiveChips() {
  const box = document.getElementById('\x61\x63\x74\x69\x76\x65\x43\x68\x69\x70\x73');
  if (!box) return;
  const chips = [];
  const chip = (label, kind, value) =>
    `<span class="active-chip">${esc(label)}<button data-chip="${kind}" data-value="${esc(value)}"
      aria-label="Remove ${esc(label)} filter">×</button></span>`;
  if (state.q) chips.push(chip(`"${state.q}"`, '\x71', ''));
  if (state.category !== '\x61\x6c\x6c') {
    const cat = CATEGORIES.find(c => c.id === state.category);
    chips.push(chip(cat ? cat.name : state.category, '\x63\x61\x74\x65\x67\x6f\x72\x79', ''));
  }
  state.brands.forEach(b => chips.push(chip(b, '\x62\x72\x61\x6e\x64', b)));
  state.conditions.forEach(c => chips.push(chip(c, '\x63\x6f\x6e\x64\x69\x74\x69\x6f\x6e', c)));
  if (state.inStock) chips.push(chip('\x49\x6e\x20\x73\x74\x6f\x63\x6b', '\x69\x6e\x73\x74\x6f\x63\x6b', ''));
  if (state.onSale) chips.push(chip('\x4f\x6e\x20\x73\x61\x6c\x65', '\x6f\x6e\x73\x61\x6c\x65', ''));
  if (state.maxPrice < PRICE_CEIL) chips.push(chip('\x55\x6e\x64\x65\x72\x20' + money(state.maxPrice), '\x70\x72\x69\x63\x65', ''));
  if (state.favOnly) chips.push(chip('\x57\x69\x73\x68\x6c\x69\x73\x74\x20\x6f\x6e\x6c\x79', '\x66\x61\x76', ''));
  box.innerHTML = chips.join('');
  box.hidden = !chips.length;
}
function resetFilters() {
  state.q = '';
  state.category = '\x61\x6c\x6c';
  state.brands.clear();
  state.conditions.clear();
  state.inStock = false;
  state.onSale = false;
  state.maxPrice = PRICE_CEIL;
  state.favOnly = false;
  state.page = 1;
  document.querySelectorAll('\x2e\x66\x69\x6c\x74\x65\x72\x73\x20\x69\x6e\x70\x75\x74\x5b\x74\x79\x70\x65\x3d\x22\x63\x68\x65\x63\x6b\x62\x6f\x78\x22\x5d').forEach(el => { el.checked = false; });
  const range = document.getElementById('\x70\x72\x69\x63\x65\x52\x61\x6e\x67\x65');
  range.value = PRICE_CEIL;
  document.getElementById('\x70\x72\x69\x63\x65\x4f\x75\x74').textContent = money(PRICE_CEIL) + '\x2b';
  const search = document.getElementById('\x73\x65\x61\x72\x63\x68\x49\x6e\x70\x75\x74');
  if (search) search.value = '';
  document.querySelectorAll('\x23\x63\x61\x74\x53\x65\x67\x20\x5b\x64\x61\x74\x61\x2d\x63\x61\x74\x5d').forEach(b => b.classList.toggle('\x69\x73\x2d\x6f\x6e', b.dataset.cat === '\x61\x6c\x6c'));
  paintResults();
}
function buildFilters() {
  const items = allProducts();
  const tally = key => items.reduce((acc, it) => {
    acc[it[key]] = (acc[it[key]] || 0) + 1;
    return acc;
  }, {});
  const brands = Object.entries(tally('\x62\x72\x61\x6e\x64')).sort((a, b) => b[1] - a[1]);
  const row = (kind, value, count) => `
    <label class="check">
      <input type="checkbox" data-kind="${kind}" value="${value}">
      <span>${value}</span><span class="count">${count}</span>
    </label>`;
  document.getElementById('\x62\x72\x61\x6e\x64\x46\x69\x6c\x74\x65\x72\x73').innerHTML =
    brands.map(([b, n]) => row('\x62\x72\x61\x6e\x64', b, n)).join('');
  document.getElementById('\x63\x6f\x6e\x64\x46\x69\x6c\x74\x65\x72\x73').innerHTML =
    CONDITIONS.map(c => row('\x63\x6f\x6e\x64\x69\x74\x69\x6f\x6e', c, items.filter(i => i.condition === c).length)).join('');
}
function specRows(item) {
  return [
    ['\x53\x74\x6f\x72\x61\x67\x65', item.storage],
    ['\x4d\x65\x6d\x6f\x72\x79', item.ram],
    ['\x50\x72\x6f\x63\x65\x73\x73\x6f\x72', item.chip],
    ['\x44\x69\x73\x70\x6c\x61\x79', item.display],
    ['\x43\x61\x6d\x65\x72\x61', item.camera],
    ['\x42\x61\x74\x74\x65\x72\x79', item.battery]
  ]
    .filter(([, value]) => value && value !== '\x4e\x2f\x41' && value !== '\u2014')
    .map(([label, value]) => `<div class="spec"><small>${label}</small><b>${esc(value)}</b></div>`)
    .join('');
}
let releaseModalFocus = null;
let modalOpener = null;
function openDetail(id) {
  const item = allProducts().find(i => i.id === id);
  if (!item) return;
  const modalEl = document.getElementById('\x6d\x6f\x64\x61\x6c');
  if (!modalEl.classList.contains('\x69\x73\x2d\x6f\x70\x65\x6e')) modalOpener = document.activeElement;
  const off = discount(item);
  const modal = document.getElementById('\x6d\x6f\x64\x61\x6c');
  const hasPhotos = item.images && item.images.length > 0;
  const mediaMarkup = hasPhotos ? `
    <div class="detail__gallery">
      <div class="detail__main-img-wrap">
        <img id="detailMainImg" src="${esc(item.images[0])}" alt="${esc(item.title)}">
      </div>
      ${item.images.length > 1 ? `
      <div class="\x64\x65\x74\x61\x69\x6c\x5f\x5f\x74\x68\x75\x6d\x62\x73" role="\x74\x61\x62\x6c\x69\x73\x74" aria-label="\x50\x72\x6f\x64\x75\x63\x74\x20\x70\x68\x6f\x74\x6f\x73">
        ${item.images.map((imgUrl, i) => `
          <button type="button" class="detail__thumb-btn ${i === 0 ? 'is-active' : ''}" data-thumb-idx="${i}" aria-label="Photo ${i + 1}">
            <img src="${esc(imgUrl)}" alt="Thumbnail ${i + 1}">
          </button>
        `).join('')}
      </div>` : ''}
    </div>` : deviceArt(item, 300);
  modal.querySelector('\x2e\x6d\x6f\x64\x61\x6c\x5f\x5f\x62\x6f\x78').innerHTML = `
    <button class="modal__close" data-close aria-label="Close details">${icon('close', 18)}</button>
    <div class="detail">
      <div class="detail__media">
        ${badgeMarkup(item)}
        ${mediaMarkup}
      </div>
      <div class="detail__body">
        <div>
          <span class="card__brand">${esc(item.brand)} · ${esc(item.category)}</span>
          <h2 style="font-size:1.5rem;margin-top:6px">${esc(item.title)}</h2>
        </div>
        <div class="card__price" style="margin:0">
          <span class="detail__price">${money(item.price)}</span>
          ${off ? `<del>${money(item.oldPrice)}</del><span class="off">-${off}%</span>` : ''}
        </div>
        <div class="card__rating">
          ${starRow(item.rating)}
          <span>${esc(item.rating)} <small>(${esc(item.reviews)} reviews)</small></span>
          ${stockLabel(item)}
        </div>
        <div class="card__meta">
          <span>${esc(item.condition)}</span>
          <span>${esc(item.warranty)}</span>
          <span>${item.price >= FREE_DELIVERY_OVER ? 'Free delivery' : money(DELIVERY_CHARGE) + ' delivery'}</span>
        </div>
        <p style="color:var(--muted);font-size:.94rem">${esc(item.desc)}</p>
        <div class="spec-grid">${specRows(item)}</div>
        <div class="assure">
          <div>${icon('shield', 18)}<b>Warranty backed</b><small>Service centre support</small></div>
          <div>${icon('refresh', 18)}<b>7-day returns</b><small>If it is not right</small></div>
          <div>${icon('truck', 18)}<b>Fast delivery</b><small>2-4 days nationwide</small></div>
        </div>
        ${item.stock > 0 ? `
        <div class="\x62\x75\x79\x2d\x72\x6f\x77">
          <div class="\x71\x74\x79\x20\x71\x74\x79\x2d\x2d\x6c\x67" role="\x67\x72\x6f\x75\x70" aria-label="\x51\x75\x61\x6e\x74\x69\x74\x79">
            <button type="\x62\x75\x74\x74\x6f\x6e" data-mq="\x2d\x31" aria-label="\x52\x65\x64\x75\x63\x65\x20\x71\x75\x61\x6e\x74\x69\x74\x79">−</button>
            <span id="\x6d\x6f\x64\x61\x6c\x51\x74\x79" data-max="\x24\x7b\x69\x74\x65\x6d\x2e\x73\x74\x6f\x63\x6b\x7d">1</span>
            <button type="\x62\x75\x74\x74\x6f\x6e" data-mq="\x31" aria-label="\x49\x6e\x63\x72\x65\x61\x73\x65\x20\x71\x75\x61\x6e\x74\x69\x74\x79">+</button>
          </div>
          <button class="\x62\x74\x6e\x20\x62\x74\x6e\x2d\x2d\x70\x72\x69\x6d\x61\x72\x79" data-buy="\x24\x7b\x65\x73\x63\x28\x69\x74\x65\x6d\x2e\x69\x64\x29\x7d">
            ${icon('\x63\x61\x72\x74', 18)} Buy now
          </button>
          <button class="\x62\x74\x6e\x20\x62\x74\x6e\x2d\x2d\x67\x68\x6f\x73\x74" data-add="\x24\x7b\x65\x73\x63\x28\x69\x74\x65\x6d\x2e\x69\x64\x29\x7d">Add to cart</button>
          <button class="\x62\x74\x6e\x20\x62\x74\x6e\x2d\x2d\x67\x68\x6f\x73\x74" data-fav="\x24\x7b\x65\x73\x63\x28\x69\x74\x65\x6d\x2e\x69\x64\x29\x7d" aria-label="\x53\x61\x76\x65\x20\x74\x6f\x20\x77\x69\x73\x68\x6c\x69\x73\x74">
            ${icon('\x68\x65\x61\x72\x74', 18)}
          </button>
        </div>` : `
        <div class="\x62\x75\x79\x2d\x72\x6f\x77">
          <button class="\x62\x74\x6e\x20\x62\x74\x6e\x2d\x2d\x70\x72\x69\x6d\x61\x72\x79" disabled>${icon('\x63\x61\x72\x74', 18)} Out of stock</button>
          <button class="\x62\x74\x6e\x20\x62\x74\x6e\x2d\x2d\x67\x68\x6f\x73\x74" data-fav="\x24\x7b\x65\x73\x63\x28\x69\x74\x65\x6d\x2e\x69\x64\x29\x7d" aria-label="\x53\x61\x76\x65\x20\x74\x6f\x20\x77\x69\x73\x68\x6c\x69\x73\x74">
            ${icon('\x68\x65\x61\x72\x74', 18)}
          </button>
        </div>`}
        <p class="safety">${icon('shield', 14)} <b>Cash on delivery available.</b> Inspect the device
        before you pay, and keep the invoice for warranty claims.</p>
      </div>
    </div>
    ${relatedMarkup(item)}`;
  if (hasPhotos && item.images.length > 1) {
    const mainImg = modal.querySelector('\x23\x64\x65\x74\x61\x69\x6c\x4d\x61\x69\x6e\x49\x6d\x67');
    const thumbBtns = modal.querySelectorAll('\x2e\x64\x65\x74\x61\x69\x6c\x5f\x5f\x74\x68\x75\x6d\x62\x2d\x62\x74\x6e');
    thumbBtns.forEach(btn => {
      btn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
        const idx = parseInt(btn.dataset.thumbIdx, 10);
        if (mainImg && item.images[idx]) {
          mainImg.src = item.images[idx];
          thumbBtns.forEach(b => b.classList.remove('\x69\x73\x2d\x61\x63\x74\x69\x76\x65'));
          btn.classList.add('\x69\x73\x2d\x61\x63\x74\x69\x76\x65');
        }
      });
    });
  }
  if (releaseModalFocus) releaseModalFocus(false);
  modal.classList.add('\x69\x73\x2d\x6f\x70\x65\x6e');
  document.body.classList.add('\x6e\x6f\x2d\x73\x63\x72\x6f\x6c\x6c');
  releaseModalFocus = trapFocus(modal, modalOpener);
  modal.querySelector('\x2e\x6d\x6f\x64\x61\x6c\x5f\x5f\x63\x6c\x6f\x73\x65').focus();
  pushRecent(item.id);
  modal.querySelector('\x2e\x6d\x6f\x64\x61\x6c\x5f\x5f\x62\x6f\x78').scrollTop = 0;
}
function relatedMarkup(item) {
  const related = allProducts()
    .filter(p => p.id !== item.id && p.category === item.category)
    .sort((a, b) => Math.abs(a.price - item.price) - Math.abs(b.price - item.price))
    .slice(0, 4);
  if (!related.length) return '';
  return `
    <div class="related">
      <h3>You might also like</h3>
      <div class="related__row">
        ${related.map(p => `
          <button class="\x72\x65\x6c\x61\x74\x65\x64\x5f\x5f\x69\x74\x65\x6d" data-open="\x24\x7b\x65\x73\x63\x28\x70\x2e\x69\x64\x29\x7d">
            <span class="\x72\x65\x6c\x61\x74\x65\x64\x5f\x5f\x61\x72\x74">${deviceArt(p, 74)}</span>
            <b>${esc(p.title)}</b>
            <span>${money(p.price)}</span>
          </button>`).join('')}
      </div>
    </div>`;
}
function closeDetail() {
  document.getElementById('\x6d\x6f\x64\x61\x6c').classList.remove('\x69\x73\x2d\x6f\x70\x65\x6e');
  document.body.classList.remove('\x6e\x6f\x2d\x73\x63\x72\x6f\x6c\x6c');
  if (releaseModalFocus) { releaseModalFocus(); releaseModalFocus = null; }
  modalOpener = null;
  paintRecent();
}
function paintRecent() {
  const section = document.getElementById('\x72\x65\x63\x65\x6e\x74\x53\x65\x63\x74\x69\x6f\x6e');
  if (!section) return;
  const recent = getRecent().slice(0, 6);
  section.hidden = recent.length < 2;
  if (recent.length < 2) return;
  document.getElementById('\x72\x65\x63\x65\x6e\x74\x52\x6f\x77').innerHTML = recent.map(p => `
    <button class="related__item" data-open="${esc(p.id)}">
      <span class="related__art">${deviceArt(p, 74)}</span>
      <b>${esc(p.title)}</b>
      <span>${money(p.price)}</span>
    </button>`).join('');
}
function initHome() {
  buildFilters();
  paintRecent();
  const grid = document.getElementById('\x67\x72\x69\x64');
  grid.innerHTML = skeletonMarkup(8);
  setTimeout(paintResults, 380);
  const search = document.getElementById('\x73\x65\x61\x72\x63\x68\x49\x6e\x70\x75\x74');
  const runSearch = () => {
    state.q = search.value.trim();
    state.page = 1;
    paintResults();
  };
  let typing;
  search.addEventListener('\x69\x6e\x70\x75\x74', () => {
    clearTimeout(typing);
    typing = setTimeout(runSearch, 220);
  });
  document.getElementById('\x73\x65\x61\x72\x63\x68\x46\x6f\x72\x6d').addEventListener('\x73\x75\x62\x6d\x69\x74', e => {
    e.preventDefault();
    runSearch();
    document.getElementById('\x62\x72\x6f\x77\x73\x65').scrollIntoView({ behavior: '\x73\x6d\x6f\x6f\x74\x68' });
  });
  document.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x71\x75\x69\x63\x6b\x5d').forEach(btn => {
    btn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      search.value = btn.dataset.quick;
      runSearch();
      document.getElementById('\x62\x72\x6f\x77\x73\x65').scrollIntoView({ behavior: '\x73\x6d\x6f\x6f\x74\x68' });
    });
  });
  document.body.addEventListener('\x63\x6c\x69\x63\x6b', e => {
    const btn = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x63\x61\x74\x5d');
    if (!btn) return;
    state.category = btn.dataset.cat;
    state.page = 1;
    document.querySelectorAll('\x23\x63\x61\x74\x53\x65\x67\x20\x5b\x64\x61\x74\x61\x2d\x63\x61\x74\x5d').forEach(b =>
      b.classList.toggle('\x69\x73\x2d\x6f\x6e', b.dataset.cat === state.category));
    paintResults();
    document.getElementById('\x62\x72\x6f\x77\x73\x65').scrollIntoView({ behavior: '\x73\x6d\x6f\x6f\x74\x68' });
  });
  document.querySelector('\x2e\x66\x69\x6c\x74\x65\x72\x73').addEventListener('\x63\x68\x61\x6e\x67\x65', e => {
    const box = e.target.closest('\x69\x6e\x70\x75\x74\x5b\x74\x79\x70\x65\x3d\x22\x63\x68\x65\x63\x6b\x62\x6f\x78\x22\x5d');
    if (!box) return;
    if (box.id === '\x69\x6e\x53\x74\x6f\x63\x6b\x4f\x6e\x6c\x79') { state.inStock = box.checked; state.page = 1; return paintResults(); }
    if (box.id === '\x6f\x6e\x53\x61\x6c\x65\x4f\x6e\x6c\x79')  { state.onSale = box.checked;  state.page = 1; return paintResults(); }
    const bucket = { brand: state.brands, condition: state.conditions }[box.dataset.kind];
    if (!bucket) return;
    box.checked ? bucket.add(box.value) : bucket.delete(box.value);
    state.page = 1;
    paintResults();
  });
  const range = document.getElementById('\x70\x72\x69\x63\x65\x52\x61\x6e\x67\x65');
  const out = document.getElementById('\x70\x72\x69\x63\x65\x4f\x75\x74');
  range.addEventListener('\x69\x6e\x70\x75\x74', () => {
    state.maxPrice = +range.value;
    out.textContent = money(state.maxPrice) + (state.maxPrice >= PRICE_CEIL ? '\x2b' : '');
    state.page = 1;
    paintResults();
  });
  document.getElementById('\x73\x6f\x72\x74\x53\x65\x6c\x65\x63\x74').addEventListener('\x63\x68\x61\x6e\x67\x65', e => {
    state.sort = e.target.value;
    paintResults();
  });
  document.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x76\x69\x65\x77\x5d').forEach(btn => {
    btn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      state.view = btn.dataset.view;
      document.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x76\x69\x65\x77\x5d').forEach(b =>
        b.classList.toggle('\x69\x73\x2d\x6f\x6e', b.dataset.view === state.view));
      paintResults();
    });
  });
  document.getElementById('\x66\x61\x76\x54\x6f\x67\x67\x6c\x65').addEventListener('\x63\x6c\x69\x63\x6b', e => {
    state.favOnly = !state.favOnly;
    state.page = 1;
    e.currentTarget.classList.toggle('\x69\x73\x2d\x6f\x6e', state.favOnly);
    paintResults();
  });
  document.getElementById('\x72\x65\x73\x65\x74\x46\x69\x6c\x74\x65\x72\x73').addEventListener('\x63\x6c\x69\x63\x6b', resetFilters);
  document.getElementById('\x6c\x6f\x61\x64\x4d\x6f\x72\x65').addEventListener('\x63\x6c\x69\x63\x6b', () => {
    state.page++;
    paintResults();
  });
  document.getElementById('\x61\x63\x74\x69\x76\x65\x43\x68\x69\x70\x73').addEventListener('\x63\x6c\x69\x63\x6b', e => {
    const btn = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x63\x68\x69\x70\x5d');
    if (!btn) return;
    const { chip, value } = btn.dataset;
    if (chip === '\x71') { state.q = ''; search.value = ''; }
    if (chip === '\x63\x61\x74\x65\x67\x6f\x72\x79') {
      state.category = '\x61\x6c\x6c';
      document.querySelectorAll('\x23\x63\x61\x74\x53\x65\x67\x20\x5b\x64\x61\x74\x61\x2d\x63\x61\x74\x5d').forEach(b => b.classList.toggle('\x69\x73\x2d\x6f\x6e', b.dataset.cat === '\x61\x6c\x6c'));
    }
    if (chip === '\x62\x72\x61\x6e\x64')     state.brands.delete(value);
    if (chip === '\x63\x6f\x6e\x64\x69\x74\x69\x6f\x6e') state.conditions.delete(value);
    if (chip === '\x69\x6e\x73\x74\x6f\x63\x6b') { state.inStock = false; document.getElementById('\x69\x6e\x53\x74\x6f\x63\x6b\x4f\x6e\x6c\x79').checked = false; }
    if (chip === '\x6f\x6e\x73\x61\x6c\x65')  { state.onSale = false;  document.getElementById('\x6f\x6e\x53\x61\x6c\x65\x4f\x6e\x6c\x79').checked = false; }
    if (chip === '\x70\x72\x69\x63\x65') {
      state.maxPrice = PRICE_CEIL;
      range.value = PRICE_CEIL;
      out.textContent = money(PRICE_CEIL) + '\x2b';
    }
    if (chip === '\x66\x61\x76') {
      state.favOnly = false;
      document.getElementById('\x66\x61\x76\x54\x6f\x67\x67\x6c\x65').classList.remove('\x69\x73\x2d\x6f\x6e');
    }
    document.querySelectorAll('\x2e\x66\x69\x6c\x74\x65\x72\x73\x20\x69\x6e\x70\x75\x74\x5b\x74\x79\x70\x65\x3d\x22\x63\x68\x65\x63\x6b\x62\x6f\x78\x22\x5d').forEach(el => {
      if (el.value === value) el.checked = false;
    });
    state.page = 1;
    paintResults();
  });
  const filters = document.querySelector('\x2e\x66\x69\x6c\x74\x65\x72\x73');
  document.getElementById('\x66\x69\x6c\x74\x65\x72\x54\x6f\x67\x67\x6c\x65').addEventListener('\x63\x6c\x69\x63\x6b', () => {
    filters.classList.add('\x69\x73\x2d\x6f\x70\x65\x6e');
    document.body.classList.add('\x6e\x6f\x2d\x73\x63\x72\x6f\x6c\x6c');
  });
  document.getElementById('\x66\x69\x6c\x74\x65\x72\x43\x6c\x6f\x73\x65').addEventListener('\x63\x6c\x69\x63\x6b', () => {
    filters.classList.remove('\x69\x73\x2d\x6f\x70\x65\x6e');
    document.body.classList.remove('\x6e\x6f\x2d\x73\x63\x72\x6f\x6c\x6c');
  });
  document.body.addEventListener('\x63\x6c\x69\x63\x6b', e => {
    const favBtn = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x66\x61\x76\x5d');
    if (favBtn) {
      e.preventDefault();
      const on = toggleFav(favBtn.dataset.fav);
      favBtn.classList.toggle('\x69\x73\x2d\x6f\x6e', on);
      favBtn.setAttribute('\x61\x72\x69\x61\x2d\x70\x72\x65\x73\x73\x65\x64', String(on));
      toast(on ? '\x53\x61\x76\x65\x64\x20\x74\x6f\x20\x79\x6f\x75\x72\x20\x77\x69\x73\x68\x6c\x69\x73\x74' : '\x52\x65\x6d\x6f\x76\x65\x64\x20\x66\x72\x6f\x6d\x20\x77\x69\x73\x68\x6c\x69\x73\x74', on ? '\x68\x65\x61\x72\x74' : '\x63\x68\x65\x63\x6b');
      if (state.favOnly) paintResults();
      return;
    }
    const stepper = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x6d\x71\x5d');
    if (stepper) {
      const out = document.getElementById('\x6d\x6f\x64\x61\x6c\x51\x74\x79');
      const max = +out.dataset.max || 1;
      out.textContent = Math.max(1, Math.min(max, +out.textContent + +stepper.dataset.mq));
      return;
    }
    const open = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x6f\x70\x65\x6e\x5d');
    if (open) {
      e.preventDefault();
      openDetail(open.dataset.open);
      return;
    }
    const card = e.target.closest('\x2e\x63\x61\x72\x64\x3a\x6e\x6f\x74\x28\x2e\x63\x61\x72\x64\x2d\x2d\x73\x6b\x65\x6c\x65\x74\x6f\x6e\x29');
    if (card && card.dataset.id && !e.target.closest('\x2e\x66\x61\x76\x2c\x20\x5b\x64\x61\x74\x61\x2d\x61\x64\x64\x5d\x2c\x20\x5b\x64\x61\x74\x61\x2d\x62\x75\x79\x5d')) {
      openDetail(card.dataset.id);
      return;
    }
    const addBtn = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x61\x64\x64\x5d');
    const buyBtn = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x62\x75\x79\x5d');
    if (addBtn || buyBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = addBtn ? addBtn.dataset.add : (buyBtn ? buyBtn.dataset.buy : null);
      if (!id) return;
      const qtyEl = document.getElementById('\x6d\x6f\x64\x61\x6c\x51\x74\x79');
      const inModal = (addBtn || buyBtn).closest('\x2e\x6d\x6f\x64\x61\x6c');
      const qty = inModal && qtyEl ? +qtyEl.textContent || 1 : 1;
      const result = addToCart(id, qty);
      if (result === '\x6f\x75\x74')     return toast('\x53\x6f\x72\x72\x79\x2c\x20\x74\x68\x61\x74\x20\x6f\x6e\x65\x20\x69\x73\x20\x6f\x75\x74\x20\x6f\x66\x20\x73\x74\x6f\x63\x6b', '\x63\x6c\x6f\x73\x65');
      if (result === '\x6d\x61\x78')     return toast('\x54\x68\x61\x74\x20\x69\x73\x20\x61\x6c\x6c\x20\x77\x65\x20\x68\x61\x76\x65\x20\x69\x6e\x20\x73\x74\x6f\x63\x6b', '\x63\x6c\x6f\x73\x65');
      if (buyBtn) {
        const user = window.SheetEndpoint ? window.SheetEndpoint.getCurrentUser() : null;
        if (!user) {
          if (inModal) closeDetail();
          toast('\x50\x6c\x65\x61\x73\x65\x20\x63\x72\x65\x61\x74\x65\x20\x61\x6e\x20\x61\x63\x63\x6f\x75\x6e\x74\x20\x6f\x72\x20\x73\x69\x67\x6e\x20\x69\x6e\x20\x74\x6f\x20\x63\x6f\x6d\x70\x6c\x65\x74\x65\x20\x79\x6f\x75\x72\x20\x70\x75\x72\x63\x68\x61\x73\x65', '\x75\x73\x65\x72\x73');
          if (typeof openAuthModal === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') {
            openAuthModal('\x72\x65\x67\x69\x73\x74\x65\x72', '\x50\x6c\x65\x61\x73\x65\x20\x63\x72\x65\x61\x74\x65\x20\x61\x6e\x20\x61\x63\x63\x6f\x75\x6e\x74\x20\x6f\x72\x20\x73\x69\x67\x6e\x20\x69\x6e\x20\x74\x6f\x20\x63\x6f\x6d\x70\x6c\x65\x74\x65\x20\x79\x6f\x75\x72\x20\x70\x75\x72\x63\x68\x61\x73\x65\x2e', () => {
              window.location.href = '\x63\x68\x65\x63\x6b\x6f\x75\x74\x2e\x68\x74\x6d\x6c';
            });
          } else {
            window.location.href = '\x63\x68\x65\x63\x6b\x6f\x75\x74\x2e\x68\x74\x6d\x6c';
          }
          return;
        }
        window.location.href = '\x63\x68\x65\x63\x6b\x6f\x75\x74\x2e\x68\x74\x6d\x6c';
        return;
      }
      if (inModal) closeDetail();
      toast('\x41\x64\x64\x65\x64\x20\x74\x6f\x20\x79\x6f\x75\x72\x20\x63\x61\x72\x74', '\x63\x61\x72\x74');
      openCart();
    }
  });
  const modal = document.getElementById('\x6d\x6f\x64\x61\x6c');
  modal.addEventListener('\x63\x6c\x69\x63\x6b', e => {
    if (e.target === modal || e.target.closest('\x5b\x64\x61\x74\x61\x2d\x63\x6c\x6f\x73\x65\x5d')) closeDetail();
  });
  document.addEventListener('\x6b\x65\x79\x64\x6f\x77\x6e', e => {
    if (e.key === '\x45\x73\x63\x61\x70\x65' && modal.classList.contains('\x69\x73\x2d\x6f\x70\x65\x6e')) closeDetail();
  });
  document.getElementById('\x63\x74\x61\x46\x6f\x72\x6d').addEventListener('\x73\x75\x62\x6d\x69\x74', e => {
    e.preventDefault();
    const input = e.target.querySelector('\x69\x6e\x70\x75\x74');
    toast(`Deal alerts on for ${input.value}`, '\x62\x6f\x6c\x74');
    input.value = '';
  });
  if (window.SheetEndpoint && window.SheetEndpoint.isReady()) {
    window.SheetEndpoint.fetchProducts().then(prods => {
      if (prods && prods.length > 0) {
        paintResults();
        paintBrands();
      }
    }).catch(() => {});
  }
}
document.addEventListener('\x44\x4f\x4d\x43\x6f\x6e\x74\x65\x6e\x74\x4c\x6f\x61\x64\x65\x64', initHome);