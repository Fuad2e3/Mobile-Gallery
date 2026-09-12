/* Mobile Gallery v1.0.0 - Production Protected Build. (c) 2026 Mobile Gallery Inc. All Rights Reserved. Reverse-engineering, redistribution or copying is prohibited. */
const FIXED_ADMIN_EMAIL = '\x61\x64\x6d\x69\x6e\x40\x6d\x6f\x62\x69\x6c\x65\x67\x61\x6c\x6c\x65\x72\x79\x2e\x63\x6f\x6d';
const FIXED_ADMIN_PASS  = '\x61\x64\x6d\x69\x6e\x31\x32\x33';
const ADMIN_AUTH_KEY    = '\x6d\x67\x2e\x61\x64\x6d\x69\x6e\x2e\x61\x75\x74\x68\x2e\x76\x31';
const PRICE_HINTS = {
  Apple:   [35000, 175000],
  Samsung: [12000, 160000],
  Google:  [40000, 110000],
  Xiaomi:  [9000, 115000],
  OnePlus: [18000, 95000],
  Realme:  [8000, 60000],
  Vivo:    [9000, 70000],
  Oppo:    [9000, 70000],
  Sony:    [15000, 90000],
  Asus:    [30000, 220000],
  Other:   [3000, 120000]
};
const CONDITION_FACTOR = {
  '\x42\x72\x61\x6e\x64\x20\x4e\x65\x77': 1.0,
  '\x4c\x69\x6b\x65\x20\x4e\x65\x77': 0.86,
  '\x47\x6f\x6f\x64': 0.72,
  '\x46\x61\x69\x72': 0.55
};
const draft = {
  title: '', brand: '\x41\x70\x70\x6c\x65', category: '\x70\x68\x6f\x6e\x65', price: '', oldPrice: '',
  condition: '\x42\x72\x61\x6e\x64\x20\x4e\x65\x77', storage: '\x31\x32\x38\x47\x42', ram: '\x38\x47\x42', battery: '\x31\x30\x30\x25\x20\x68\x65\x61\x6c\x74\x68',
  display: '', chip: '', camera: '', color: '\x6d\x69\x64\x6e\x69\x67\x68\x74', warranty: '\x31\x20\x79\x65\x61\x72\x20\x6f\x66\x66\x69\x63\x69\x61\x6c',
  stock: '\x35', desc: '', images: []
};
let editingProductId = null;
function resetDraft() {
  Object.assign(draft, {
    title: '', brand: '\x41\x70\x70\x6c\x65', category: '\x70\x68\x6f\x6e\x65', price: '', oldPrice: '',
    condition: '\x42\x72\x61\x6e\x64\x20\x4e\x65\x77', storage: '\x31\x32\x38\x47\x42', ram: '\x38\x47\x42', battery: '\x31\x30\x30\x25\x20\x68\x65\x61\x6c\x74\x68',
    display: '', chip: '', camera: '', color: '\x6d\x69\x64\x6e\x69\x67\x68\x74', warranty: '\x31\x20\x79\x65\x61\x72\x20\x6f\x66\x66\x69\x63\x69\x61\x6c',
    stock: '\x35', desc: '', images: []
  });
  renderAdminImagePreviews();
}
function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === '\x74\x72\x75\x65';
}
function setAdminLoggedIn(status) {
  if (status) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, '\x74\x72\x75\x65');
  } else {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
  updateAdminView();
}
function updateAdminView() {
  const loggedIn = isAdminLoggedIn();
  const loginView = document.getElementById('\x61\x64\x6d\x69\x6e\x4c\x6f\x67\x69\x6e\x56\x69\x65\x77');
  const dashView = document.getElementById('\x61\x64\x6d\x69\x6e\x44\x61\x73\x68\x62\x6f\x61\x72\x64\x56\x69\x65\x77');
  if (loginView && dashView) {
    loginView.style.display = loggedIn ? '\x6e\x6f\x6e\x65' : '\x66\x6c\x65\x78';
    dashView.style.display = loggedIn ? '\x62\x6c\x6f\x63\x6b' : '\x6e\x6f\x6e\x65';
  }
  if (loggedIn) {
    paintPreview();
    renderAdminProductsList();
    renderAdminOrdersList();
    renderAdminUsersList();
    updateConnectionPill();
  }
}
function initAdminAuth() {
  const loginForm = document.getElementById('\x61\x64\x6d\x69\x6e\x4c\x6f\x67\x69\x6e\x46\x6f\x72\x6d');
  const errorMsg = document.getElementById('\x6c\x6f\x67\x69\x6e\x45\x72\x72\x6f\x72\x4d\x73\x67');
  const logoutBtn = document.getElementById('\x61\x64\x6d\x69\x6e\x4c\x6f\x67\x6f\x75\x74\x42\x74\x6e');
  if (loginForm) {
    loginForm.addEventListener('\x73\x75\x62\x6d\x69\x74', e => {
      e.preventDefault();
      const email = document.getElementById('\x61\x64\x6d\x69\x6e\x45\x6d\x61\x69\x6c').value.trim().toLowerCase();
      const pass = document.getElementById('\x61\x64\x6d\x69\x6e\x50\x61\x73\x73\x77\x6f\x72\x64').value.trim();
      if (email === FIXED_ADMIN_EMAIL && pass === FIXED_ADMIN_PASS) {
        if (errorMsg) errorMsg.style.display = '\x6e\x6f\x6e\x65';
        setAdminLoggedIn(true);
        toast('\x41\x64\x6d\x69\x6e\x20\x61\x75\x74\x68\x65\x6e\x74\x69\x63\x61\x74\x69\x6f\x6e\x20\x73\x75\x63\x63\x65\x73\x73\x66\x75\x6c', '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
      } else {
        if (errorMsg) {
          errorMsg.textContent = '\x49\x6e\x76\x61\x6c\x69\x64\x20\x47\x6d\x61\x69\x6c\x20\x6f\x72\x20\x70\x61\x73\x73\x77\x6f\x72\x64\x2e\x20\x55\x73\x65\x20\x74\x68\x65\x20\x66\x69\x78\x65\x64\x20\x63\x72\x65\x64\x65\x6e\x74\x69\x61\x6c\x73\x20\x70\x72\x6f\x76\x69\x64\x65\x64\x2e';
          errorMsg.style.display = '\x62\x6c\x6f\x63\x6b';
        }
        toast('\x49\x6e\x76\x61\x6c\x69\x64\x20\x63\x72\x65\x64\x65\x6e\x74\x69\x61\x6c\x73', '\x63\x6c\x6f\x73\x65');
      }
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      setAdminLoggedIn(false);
      toast('\x4c\x6f\x67\x67\x65\x64\x20\x6f\x75\x74\x20\x6f\x66\x20\x41\x64\x6d\x69\x6e\x20\x50\x6f\x72\x74\x61\x6c', '\x63\x68\x65\x63\x6b');
    });
  }
}
function initAdminTabs() {
  const tabs = document.querySelectorAll('\x2e\x61\x64\x6d\x69\x6e\x2d\x74\x61\x62\x2d\x62\x74\x6e');
  tabs.forEach(tab => {
    tab.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      tabs.forEach(t => t.classList.remove('\x69\x73\x2d\x61\x63\x74\x69\x76\x65'));
      tab.classList.add('\x69\x73\x2d\x61\x63\x74\x69\x76\x65');
      const targetPane = tab.dataset.tab;
      document.querySelectorAll('\x2e\x61\x64\x6d\x69\x6e\x2d\x74\x61\x62\x2d\x70\x61\x6e\x65').forEach(pane => {
        pane.hidden = true;
      });
      const paneMap = {
        addProduct: '\x70\x61\x6e\x65\x41\x64\x64\x50\x72\x6f\x64\x75\x63\x74',
        manageProducts: '\x70\x61\x6e\x65\x4d\x61\x6e\x61\x67\x65\x50\x72\x6f\x64\x75\x63\x74\x73',
        manageOrders: '\x70\x61\x6e\x65\x4d\x61\x6e\x61\x67\x65\x4f\x72\x64\x65\x72\x73',
        manageUsers: '\x70\x61\x6e\x65\x4d\x61\x6e\x61\x67\x65\x55\x73\x65\x72\x73',
        sheetSettings: '\x70\x61\x6e\x65\x53\x68\x65\x65\x74\x53\x65\x74\x74\x69\x6e\x67\x73'
      };
      const el = document.getElementById(paneMap[targetPane]);
      if (el) el.hidden = false;
      if (targetPane === '\x6d\x61\x6e\x61\x67\x65\x4f\x72\x64\x65\x72\x73') renderAdminOrdersList();
      if (targetPane === '\x6d\x61\x6e\x61\x67\x65\x50\x72\x6f\x64\x75\x63\x74\x73') renderAdminProductsList();
      if (targetPane === '\x6d\x61\x6e\x61\x67\x65\x55\x73\x65\x72\x73') renderAdminUsersList();
    });
  });
}
function switchTab(tabName) {
  const tabBtn = document.querySelector(`.admin-tab-btn[data-tab="${tabName}"]`);
  if (tabBtn) tabBtn.click();
}
function draftToProduct() {
  return {
    ...draft,
    id: '\x64\x72\x61\x66\x74',
    price: +draft.price || 0,
    oldPrice: +draft.oldPrice || 0,
    stock: Math.max(0, +draft.stock || 0),
    images: [...(draft.images || [])],
    added: 0,
    views: 0,
    rating: 5,
    reviews: 0,
    tags: draft.condition === '\x42\x72\x61\x6e\x64\x20\x4e\x65\x77' ? ['\x6e\x65\x77'] : [],
    title: draft.title || '\x50\x72\x6f\x64\x75\x63\x74\x20\x74\x69\x74\x6c\x65\x20\x61\x70\x70\x65\x61\x72\x73\x20\x68\x65\x72\x65'
  };
}
function paintPreview() {
  const item = draftToProduct();
  const off = discount(item);
  const previewBox = document.getElementById('\x70\x72\x65\x76\x69\x65\x77');
  if (!previewBox) return;
  const mediaMarkup = (item.images && item.images.length > 0)
    ? `<img src="${esc(item.images[0])}" alt="${esc(item.title)}" style="width:100%;height:100%;object-fit:contain;border-radius:var(--r-md)">`
    : deviceArt(item, 168);
  previewBox.innerHTML = `
    <article class="card">
      <div class="card__media">
        ${item.tags.includes('new') ? '<div class="badges"><span class="badge badge--new">Brand new</span></div>' : ''}
        ${mediaMarkup}
      </div>
      <div class="card__body">
        <span class="card__brand">${esc(item.brand)} · ${esc(item.condition)}</span>
        <h3 class="card__title">${esc(item.title)}</h3>
        <div class="card__meta">
          ${item.storage !== 'N/A' ? `<span>${esc(item.storage)}</span>` : ''}
          ${item.ram !== 'N/A' ? `<span>${esc(item.ram)} RAM</span>` : ''}
          ${item.battery !== 'N/A' ? `<span>${esc(item.battery)}</span>` : ''}
        </div>
        <div class="card__price">
          <b>${item.price ? money(item.price) : '৳ —'}</b>
          ${off ? `<del>${money(item.oldPrice)}</del><span class="off">-${off}%</span>` : ''}
        </div>
        <div class="card__rating">
          ${starRow(item.rating)}
          <span>New</span>
          ${stockLabel(item)}
        </div>
      </div>
    </article>`;
  paintHint();
}
function paintHint() {
  const box = document.getElementById('\x70\x72\x69\x63\x65\x48\x69\x6e\x74');
  if (!box) return;
  const [lo, hi] = PRICE_HINTS[draft.brand] || PRICE_HINTS.Other;
  const factor = CONDITION_FACTOR[draft.condition] || 0.8;
  const low = Math.round((lo * factor) / 500) * 500;
  const high = Math.round((hi * factor) / 500) * 500;
  const price = +draft.price;
  let verdict = `<b>${esc(draft.brand)}</b> in <b>${esc(draft.condition)}</b> condition
                 usually retails between <b>${money(low)}</b> and <b>${money(high)}</b>.`;
  let tone = '\x76\x61\x72\x28\x2d\x2d\x6d\x75\x74\x65\x64\x29';
  if (price > 0) {
    if (price < low) {
      verdict += ` This price is <b>below the usual range</b>.`;
      tone = '\x76\x61\x72\x28\x2d\x2d\x61\x6d\x62\x65\x72\x29';
    } else if (price > high) {
      verdict += ` This price is <b>above the usual range</b>.`;
      tone = '\x76\x61\x72\x28\x2d\x2d\x72\x6f\x73\x65\x29';
    } else {
      verdict += ` This price is <b>right in the sweet spot</b>.`;
      tone = '\x76\x61\x72\x28\x2d\x2d\x6d\x69\x6e\x74\x29';
    }
  }
  box.innerHTML = verdict;
  box.style.borderColor = tone;
}
function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('\x69\x6d\x61\x67\x65\x2f')) {
      return reject(new Error('\x46\x69\x6c\x65\x20\x69\x73\x20\x6e\x6f\x74\x20\x61\x6e\x20\x69\x6d\x61\x67\x65'));
    }
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('\x63\x61\x6e\x76\x61\x73');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('\x32\x64');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = '\x68\x69\x67\x68';
        ctx.drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL('\x69\x6d\x61\x67\x65\x2f\x77\x65\x62\x70', quality);
        if (!dataUrl.startsWith('\x64\x61\x74\x61\x3a\x69\x6d\x61\x67\x65\x2f\x77\x65\x62\x70')) {
          dataUrl = canvas.toDataURL('\x69\x6d\x61\x67\x65\x2f\x6a\x70\x65\x67', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('\x49\x6d\x61\x67\x65\x20\x66\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x6c\x6f\x61\x64'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x72\x65\x61\x64\x20\x66\x69\x6c\x65'));
    reader.readAsDataURL(file);
  });
}
function renderAdminImagePreviews() {
  const strip = document.getElementById('\x61\x64\x6d\x69\x6e\x49\x6d\x61\x67\x65\x50\x72\x65\x76\x69\x65\x77\x53\x74\x72\x69\x70');
  if (!strip) return;
  if (!draft.images || draft.images.length === 0) {
    strip.innerHTML = '\x3c\x73\x70\x61\x6e\x20\x73\x74\x79\x6c\x65\x3d\x22\x63\x6f\x6c\x6f\x72\x3a\x76\x61\x72\x28\x2d\x2d\x6d\x75\x74\x65\x64\x29\x3b\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x2e\x38\x32\x72\x65\x6d\x22\x3e\x4e\x6f\x20\x70\x68\x6f\x74\x6f\x73\x20\x73\x65\x6c\x65\x63\x74\x65\x64\x20\x79\x65\x74\x20\x28\x31\x20\x74\x6f\x20\x35\x20\x70\x68\x6f\x74\x6f\x73\x29\x2e\x3c\x2f\x73\x70\x61\x6e\x3e';
    return;
  }
  strip.innerHTML = draft.images.map((imgUrl, idx) => `
    <div class="image-preview-item" title="Photo ${idx + 1}">
      <img src="${esc(imgUrl)}" alt="Photo ${idx + 1}">
      <button type="button" class="image-preview-remove" data-remove-img="${idx}" title="Remove photo" aria-label="Remove photo">✕</button>
    </div>
  `).join('');
  strip.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x72\x65\x6d\x6f\x76\x65\x2d\x69\x6d\x67\x5d').forEach(btn => {
    btn.addEventListener('\x63\x6c\x69\x63\x6b', e => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.removeImg, 10);
      if (!isNaN(idx) && idx >= 0 && idx < draft.images.length) {
        draft.images.splice(idx, 1);
        renderAdminImagePreviews();
        paintPreview();
      }
    });
  });
}
function initAdminPhotos() {
  const dropZone = document.getElementById('\x66\x69\x6c\x65\x44\x72\x6f\x70\x5a\x6f\x6e\x65');
  const fileInput = document.getElementById('\x61\x64\x6d\x69\x6e\x49\x6d\x61\x67\x65\x49\x6e\x70\x75\x74');
  const urlInput = document.getElementById('\x61\x64\x6d\x69\x6e\x49\x6d\x61\x67\x65\x55\x72\x6c\x49\x6e\x70\x75\x74');
  const addUrlBtn = document.getElementById('\x61\x64\x6d\x69\x6e\x41\x64\x64\x49\x6d\x61\x67\x65\x55\x72\x6c\x42\x74\x6e');
  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    const remainingSlots = 5 - (draft.images ? draft.images.length : 0);
    if (remainingSlots <= 0) {
      return toast('\x4d\x61\x78\x69\x6d\x75\x6d\x20\x35\x20\x70\x68\x6f\x74\x6f\x73\x20\x61\x6c\x6c\x6f\x77\x65\x64\x20\x70\x65\x72\x20\x70\x72\x6f\x64\x75\x63\x74', '\x63\x6c\x6f\x73\x65');
    }
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    toast(`Optimizing ${filesToProcess.length} image(s)...`, '\x63\x68\x65\x63\x6b');
    try {
      const compressedUrls = await Promise.all(
        filesToProcess.map(file => compressImageFile(file))
      );
      draft.images = draft.images || [];
      draft.images.push(...compressedUrls);
      renderAdminImagePreviews();
      paintPreview();
      toast(`${compressedUrls.length} photo(s) added and optimized!`, '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
    } catch (err) {
      console.error('\x49\x6d\x61\x67\x65\x20\x63\x6f\x6d\x70\x72\x65\x73\x73\x69\x6f\x6e\x20\x65\x72\x72\x6f\x72\x3a', err);
      toast('\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x70\x72\x6f\x63\x65\x73\x73\x20\x6f\x6e\x65\x20\x6f\x72\x20\x6d\x6f\x72\x65\x20\x69\x6d\x61\x67\x65\x73', '\x63\x6c\x6f\x73\x65');
    }
  };
  if (fileInput) {
    fileInput.addEventListener('\x63\x68\x61\x6e\x67\x65', e => {
      handleFiles(e.target.files);
      fileInput.value = '';
    });
  }
  if (dropZone) {
    ['\x64\x72\x61\x67\x65\x6e\x74\x65\x72', '\x64\x72\x61\x67\x6f\x76\x65\x72'].forEach(eventName => {
      dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('\x69\x73\x2d\x64\x72\x61\x67\x6f\x76\x65\x72');
      });
    });
    ['\x64\x72\x61\x67\x6c\x65\x61\x76\x65', '\x64\x72\x6f\x70'].forEach(eventName => {
      dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('\x69\x73\x2d\x64\x72\x61\x67\x6f\x76\x65\x72');
      });
    });
    dropZone.addEventListener('\x64\x72\x6f\x70', e => {
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    });
  }
  const addUrl = () => {
    if (!urlInput) return;
    const val = urlInput.value.trim();
    if (!val) return;
    const urls = val.split('\x2c').map(u => u.trim()).filter(Boolean);
    const remaining = 5 - (draft.images ? draft.images.length : 0);
    if (remaining <= 0) {
      return toast('\x4d\x61\x78\x69\x6d\x75\x6d\x20\x35\x20\x70\x68\x6f\x74\x6f\x73\x20\x61\x6c\x6c\x6f\x77\x65\x64', '\x63\x6c\x6f\x73\x65');
    }
    const toAdd = urls.slice(0, remaining);
    draft.images = draft.images || [];
    draft.images.push(...toAdd);
    urlInput.value = '';
    renderAdminImagePreviews();
    paintPreview();
    toast(`${toAdd.length} image URL(s) added!`, '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
  };
  if (addUrlBtn) {
    addUrlBtn.addEventListener('\x63\x6c\x69\x63\x6b', addUrl);
  }
  if (urlInput) {
    urlInput.addEventListener('\x6b\x65\x79\x64\x6f\x77\x6e', e => {
      if (e.key === '\x45\x6e\x74\x65\x72') {
        e.preventDefault();
        addUrl();
      }
    });
  }
}
const RULES = {
  title: v => v.trim().length >= 5  || '\x47\x69\x76\x65\x20\x74\x68\x65\x20\x70\x72\x6f\x64\x75\x63\x74\x20\x6e\x61\x6d\x65\x2c\x20\x61\x74\x20\x6c\x65\x61\x73\x74\x20\x35\x20\x63\x68\x61\x72\x61\x63\x74\x65\x72\x73\x2e',
  price: v => (Number.isFinite(+v) && +v > 0 && +v < 5000000) || '\x45\x6e\x74\x65\x72\x20\x61\x20\x72\x65\x61\x6c\x69\x73\x74\x69\x63\x20\x70\x72\x69\x63\x65\x20\x69\x6e\x20\x54\x61\x6b\x61\x2e',
  stock: v => (Number.isInteger(+v) && +v >= 0 && +v <= 9999) || '\x53\x74\x6f\x63\x6b\x20\x6d\x75\x73\x74\x20\x62\x65\x20\x61\x20\x77\x68\x6f\x6c\x65\x20\x6e\x75\x6d\x62\x65\x72\x2e',
  desc:  v => v.trim().length >= 10 || '\x44\x65\x73\x63\x72\x69\x62\x65\x20\x74\x68\x65\x20\x70\x72\x6f\x64\x75\x63\x74\x20\u2014\x20\x61\x74\x20\x6c\x65\x61\x73\x74\x20\x31\x30\x20\x63\x68\x61\x72\x61\x63\x74\x65\x72\x73\x2e'
};
function validateField(input) {
  const rule = RULES[input.name];
  if (!rule) return true;
  const result = rule(input.value);
  const err = input.parentElement.querySelector('\x2e\x65\x72\x72');
  const ok = result === true;
  input.classList.toggle('\x69\x73\x2d\x62\x61\x64', !ok);
  if (err) {
    err.textContent = ok ? '' : result;
    err.classList.toggle('\x69\x73\x2d\x6f\x6e', !ok);
  }
  return ok;
}
function startEditProduct(id) {
  const prod = productById(id);
  if (!prod) return toast('\x50\x72\x6f\x64\x75\x63\x74\x20\x6e\x6f\x74\x20\x66\x6f\x75\x6e\x64', '\x63\x6c\x6f\x73\x65');
  editingProductId = id;
  draft.title = prod.title || '';
  draft.brand = prod.brand || '\x41\x70\x70\x6c\x65';
  draft.category = prod.category || '\x70\x68\x6f\x6e\x65';
  draft.price = String(prod.price || '');
  draft.oldPrice = prod.oldPrice ? String(prod.oldPrice) : '';
  draft.condition = prod.condition || '\x42\x72\x61\x6e\x64\x20\x4e\x65\x77';
  draft.storage = prod.storage || '\x31\x32\x38\x47\x42';
  draft.ram = prod.ram || '\x38\x47\x42';
  draft.battery = prod.battery || '\x31\x30\x30\x25\x20\x68\x65\x61\x6c\x74\x68';
  draft.display = prod.display || '';
  draft.chip = prod.chip || '';
  draft.camera = prod.camera || '';
  draft.color = prod.color || '\x6d\x69\x64\x6e\x69\x67\x68\x74';
  draft.warranty = prod.warranty || '\x31\x20\x79\x65\x61\x72\x20\x6f\x66\x66\x69\x63\x69\x61\x6c';
  draft.stock = String(prod.stock !== undefined ? prod.stock : 5);
  draft.desc = prod.desc || '';
  draft.images = Array.isArray(prod.images) ? [...prod.images] : [];
  const form = document.getElementById('\x61\x64\x6d\x69\x6e\x46\x6f\x72\x6d');
  if (form) {
    if (form.elements['\x74\x69\x74\x6c\x65']) form.elements['\x74\x69\x74\x6c\x65'].value = draft.title;
    if (form.elements['\x62\x72\x61\x6e\x64']) form.elements['\x62\x72\x61\x6e\x64'].value = draft.brand;
    if (form.elements['\x63\x61\x74\x65\x67\x6f\x72\x79']) form.elements['\x63\x61\x74\x65\x67\x6f\x72\x79'].value = draft.category;
    if (form.elements['\x70\x72\x69\x63\x65']) form.elements['\x70\x72\x69\x63\x65'].value = draft.price;
    if (form.elements['\x6f\x6c\x64\x50\x72\x69\x63\x65']) form.elements['\x6f\x6c\x64\x50\x72\x69\x63\x65'].value = draft.oldPrice;
    if (form.elements['\x63\x6f\x6e\x64\x69\x74\x69\x6f\x6e']) form.elements['\x63\x6f\x6e\x64\x69\x74\x69\x6f\x6e'].value = draft.condition;
    if (form.elements['\x73\x74\x6f\x72\x61\x67\x65']) form.elements['\x73\x74\x6f\x72\x61\x67\x65'].value = draft.storage;
    if (form.elements['\x72\x61\x6d']) form.elements['\x72\x61\x6d'].value = draft.ram;
    if (form.elements['\x62\x61\x74\x74\x65\x72\x79']) form.elements['\x62\x61\x74\x74\x65\x72\x79'].value = draft.battery;
    if (form.elements['\x63\x68\x69\x70']) form.elements['\x63\x68\x69\x70'].value = draft.chip;
    if (form.elements['\x77\x61\x72\x72\x61\x6e\x74\x79']) form.elements['\x77\x61\x72\x72\x61\x6e\x74\x79'].value = draft.warranty;
    if (form.elements['\x73\x74\x6f\x63\x6b']) form.elements['\x73\x74\x6f\x63\x6b'].value = draft.stock;
    if (form.elements['\x64\x65\x73\x63']) form.elements['\x64\x65\x73\x63'].value = draft.desc;
  }
  const swatchBox = document.getElementById('\x73\x77\x61\x74\x63\x68\x65\x73');
  if (swatchBox) {
    swatchBox.querySelectorAll('\x2e\x73\x77\x61\x74\x63\x68').forEach(s => {
      s.classList.toggle('\x69\x73\x2d\x6f\x6e', s.dataset.color === draft.color);
    });
  }
  const banner = document.getElementById('\x61\x64\x6d\x69\x6e\x45\x64\x69\x74\x42\x61\x6e\x6e\x65\x72');
  const titleEl = document.getElementById('\x61\x64\x6d\x69\x6e\x45\x64\x69\x74\x69\x6e\x67\x50\x72\x6f\x64\x75\x63\x74\x54\x69\x74\x6c\x65');
  const idEl = document.getElementById('\x61\x64\x6d\x69\x6e\x45\x64\x69\x74\x69\x6e\x67\x50\x72\x6f\x64\x75\x63\x74\x49\x64');
  if (banner) {
    banner.style.display = '\x66\x6c\x65\x78';
    if (titleEl) titleEl.textContent = prod.title;
    if (idEl) idEl.textContent = prod.id;
  }
  const btn = document.getElementById('\x61\x64\x64\x50\x72\x6f\x64\x75\x63\x74\x53\x75\x62\x6d\x69\x74\x42\x74\x6e');
  if (btn) btn.textContent = '\ud83d\udcbe\x20\x53\x61\x76\x65\x20\x43\x68\x61\x6e\x67\x65\x73\x20\x26\x20\x55\x70\x64\x61\x74\x65\x20\x47\x6f\x6f\x67\x6c\x65\x20\x53\x68\x65\x65\x74';
  switchTab('\x61\x64\x64\x50\x72\x6f\x64\x75\x63\x74');
  renderAdminImagePreviews();
  paintPreview();
  window.scrollTo({ top: 0, behavior: '\x73\x6d\x6f\x6f\x74\x68' });
  toast(`Editing: ${prod.title}`, '\x63\x68\x65\x63\x6b');
}
function exitEditMode() {
  editingProductId = null;
  const banner = document.getElementById('\x61\x64\x6d\x69\x6e\x45\x64\x69\x74\x42\x61\x6e\x6e\x65\x72');
  if (banner) banner.style.display = '\x6e\x6f\x6e\x65';
  const btn = document.getElementById('\x61\x64\x64\x50\x72\x6f\x64\x75\x63\x74\x53\x75\x62\x6d\x69\x74\x42\x74\x6e');
  if (btn) btn.textContent = '\x41\x64\x64\x20\x74\x6f\x20\x53\x68\x6f\x70\x20\x26\x20\x47\x6f\x6f\x67\x6c\x65\x20\x53\x68\x65\x65\x74';
  const form = document.getElementById('\x61\x64\x6d\x69\x6e\x46\x6f\x72\x6d');
  if (form) form.reset();
  resetDraft();
  paintPreview();
}
function initProductForm() {
  const form = document.getElementById('\x61\x64\x6d\x69\x6e\x46\x6f\x72\x6d');
  if (!form) return;
  const cancelEditBtn = document.getElementById('\x63\x61\x6e\x63\x65\x6c\x45\x64\x69\x74\x42\x74\x6e');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      exitEditMode();
      toast('\x45\x64\x69\x74\x69\x6e\x67\x20\x63\x61\x6e\x63\x65\x6c\x6c\x65\x64', '\x63\x6c\x6f\x73\x65');
    });
  }
  const swatchBox = document.getElementById('\x73\x77\x61\x74\x63\x68\x65\x73');
  if (swatchBox) {
    swatchBox.innerHTML = Object.entries(PALETTES).map(([key, [a, b]]) => `
      <button type="button" class="swatch ${key === draft.color ? 'is-on' : ''}" data-color="${key}"
        title="${key}" aria-label="${key}" style="background:linear-gradient(135deg,${a},${b})"></button>`).join('');
    swatchBox.addEventListener('\x63\x6c\x69\x63\x6b', e => {
      const sw = e.target.closest('\x5b\x64\x61\x74\x61\x2d\x63\x6f\x6c\x6f\x72\x5d');
      if (!sw) return;
      draft.color = sw.dataset.color;
      swatchBox.querySelectorAll('\x2e\x73\x77\x61\x74\x63\x68').forEach(s => s.classList.toggle('\x69\x73\x2d\x6f\x6e', s === sw));
      paintPreview();
    });
  }
  const condEl = document.getElementById('\x63\x6f\x6e\x64\x69\x74\x69\x6f\x6e\x46\x69\x65\x6c\x64');
  if (condEl) {
    condEl.innerHTML = CONDITIONS
      .map(v => `<option ${v === draft.condition ? 'selected' : ''}>${esc(v)}</option>`).join('');
  }
  form.addEventListener('\x69\x6e\x70\x75\x74', e => {
    const el = e.target;
    if (!el.name) return;
    if (el.name in draft) draft[el.name] = el.type === '\x63\x68\x65\x63\x6b\x62\x6f\x78' ? el.checked : el.value;
    if (el.classList.contains('\x69\x73\x2d\x62\x61\x64')) validateField(el);
    paintPreview();
  });
  form.addEventListener('\x63\x68\x61\x6e\x67\x65', e => {
    if (e.target.name) paintPreview();
  });
  form.addEventListener('\x66\x6f\x63\x75\x73\x6f\x75\x74', e => {
    if (e.target.name && RULES[e.target.name]) validateField(e.target);
  });
  form.addEventListener('\x73\x75\x62\x6d\x69\x74', async e => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('\x5b\x6e\x61\x6d\x65\x5d')].filter(el => RULES[el.name]);
    const bad = fields.filter(el => !validateField(el));
    if (bad.length) {
      bad[0].focus();
      bad[0].scrollIntoView({ behavior: '\x73\x6d\x6f\x6f\x74\x68', block: '\x63\x65\x6e\x74\x65\x72' });
      return toast(`${bad.length} field(s) need attention`, '\x63\x6c\x6f\x73\x65');
    }
    const btn = document.getElementById('\x61\x64\x64\x50\x72\x6f\x64\x75\x63\x74\x53\x75\x62\x6d\x69\x74\x42\x74\x6e');
    if (btn) {
      btn.disabled = true;
      btn.textContent = editingProductId ? '\x53\x61\x76\x69\x6e\x67\x20\x26\x20\x55\x70\x64\x61\x74\x69\x6e\x67\x20\x53\x68\x65\x65\x74\x2e\x2e\x2e' : '\x53\x61\x76\x69\x6e\x67\x20\x26\x20\x53\x79\x6e\x63\x69\x6e\x67\x2e\x2e\x2e';
    }
    if (editingProductId) {
      const existingProd = productById(editingProductId) || {};
      const updatedProduct = {
        ...draftToProduct(),
        id: editingProductId,
        display: draft.display || (existingProd.display || '\x4e\x2f\x41'),
        chip: draft.chip || (existingProd.chip || '\x4e\x2f\x41'),
        camera: draft.camera || (existingProd.camera || '\x4e\x2f\x41'),
        rating: existingProd.rating || 5,
        reviews: existingProd.reviews || 0,
        views: existingProd.views || 0,
        tags: draft.condition === '\x42\x72\x61\x6e\x64\x20\x4e\x65\x77' ? ['\x6e\x65\x77'] : (existingProd.tags || [])
      };
      if (window.SheetEndpoint) {
        await window.SheetEndpoint.updateProduct(updatedProduct);
      } else {
        updateAnyProduct(updatedProduct);
      }
      if (btn) btn.disabled = false;
      toast(`Product "${updatedProduct.title}" updated and synced to Google Sheet!`, '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
      exitEditMode();
      renderAdminProductsList();
      switchTab('\x6d\x61\x6e\x61\x67\x65\x50\x72\x6f\x64\x75\x63\x74\x73');
    } else {
      const product = {
        ...draftToProduct(),
        id: '\x6d\x67\x2d\x61' + Date.now().toString(36),
        display: draft.display || '\x4e\x2f\x41',
        chip: draft.chip || '\x4e\x2f\x41',
        camera: draft.camera || '\x4e\x2f\x41',
        views: 0
      };
      if (window.SheetEndpoint) {
        await window.SheetEndpoint.addProduct(product);
      } else {
        const added = readStore(STORE_KEY, []);
        added.unshift(product);
        writeStore(STORE_KEY, added);
      }
      if (btn) {
        btn.disabled = false;
        btn.textContent = '\x41\x64\x64\x20\x74\x6f\x20\x53\x68\x6f\x70\x20\x26\x20\x47\x6f\x6f\x67\x6c\x65\x20\x53\x68\x65\x65\x74';
      }
      toast('\x50\x72\x6f\x64\x75\x63\x74\x20\x61\x64\x64\x65\x64\x20\x61\x6e\x64\x20\x73\x79\x6e\x63\x65\x64\x20\x74\x6f\x20\x47\x6f\x6f\x67\x6c\x65\x20\x53\x68\x65\x65\x74\x21', '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
      form.reset();
      resetDraft();
      paintPreview();
      renderAdminProductsList();
    }
  });
}
async function renderAdminProductsList() {
  const box = document.getElementById('\x61\x64\x6d\x69\x6e\x4c\x69\x73\x74');
  if (!box) return;
  if (window.SheetEndpoint && window.SheetEndpoint.isReady()) {
    try {
      const sheetProducts = await window.SheetEndpoint.fetchProducts();
      if (sheetProducts && sheetProducts.length) {
        sheetProducts.forEach(sp => {
          if (sp.id) updateAnyProduct(sp);
        });
      }
    } catch (_) {}
  }
  const products = allProducts();
  const countBadge = document.getElementById('\x74\x61\x62\x50\x72\x6f\x64\x75\x63\x74\x43\x6f\x75\x6e\x74');
  if (countBadge) countBadge.textContent = products.length;
  if (!products.length) {
    box.innerHTML = `
      <div style="text-align:center;padding:36px 14px;color:var(--muted)">
        <p>No products found in catalogue.</p>
      </div>`;
    return;
  }
  box.innerHTML = products.map(p => {
    const isCustom = String(p.id).startsWith('\x6d\x67\x2d\x61');
    const stockNum = Number(p.stock !== undefined ? p.stock : 0);
    const stockBadge = stockNum === 0
      ? '\x3c\x73\x70\x61\x6e\x20\x63\x6c\x61\x73\x73\x3d\x22\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x20\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x63\x61\x6e\x63\x65\x6c\x6c\x65\x64\x22\x20\x73\x74\x79\x6c\x65\x3d\x22\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x2e\x37\x34\x72\x65\x6d\x3b\x70\x61\x64\x64\x69\x6e\x67\x3a\x32\x70\x78\x20\x38\x70\x78\x22\x3e\x4f\x75\x74\x20\x6f\x66\x20\x53\x74\x6f\x63\x6b\x20\x28\x43\x6f\x6c\x20\x59\x3a\x20\x30\x29\x3c\x2f\x73\x70\x61\x6e\x3e'
      : stockNum <= 8
        ? `<span class="status-badge status-badge--pending" style="font-size:.74rem;padding:2px 8px">Low Stock (${stockNum})</span>`
        : `<span class="status-badge status-badge--confirmed" style="font-size:.74rem;padding:2px 8px">In Stock (${stockNum})</span>`;
    const specsInfo = [
      p.storage ? `Storage: <b>${esc(p.storage)}</b>` : '',
      p.ram ? `RAM: <b>${esc(p.ram)}</b>` : '',
      p.chip ? `Chip: <b>${esc(p.chip)}</b>` : '',
      p.battery ? `Battery: <b>${esc(p.battery)}</b>` : '',
      p.color ? `Color: <b>${esc(p.color)}</b>` : '',
      p.warranty ? `Warranty: <b>${esc(p.warranty)}</b>` : ''
    ].filter(Boolean).join('\x20\u00b7\x20');
    return `
      <div class="admin-row" style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid var(--line-soft);flex-wrap:wrap">
        <span class="admin-row__art" style="flex-shrink:0">${deviceArt(p, 48)}</span>
        <span style="flex:1;min-width:260px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <b style="font-size:.96rem">${esc(p.title)}</b>
            <code style="font-size:.74rem;color:var(--muted)">${esc(p.id)}</code>
            <span class="badge-sheet-live">🟢 Sheet Cols I–Y</span>
            ${isCustom ? '<span style="background:var(--brand-600);color:#fff;font-size:.65rem;padding:1px 6px;border-radius:3px;font-weight:700">NEW</span>' : ''}
          </div>
          <div style="font-size:.82rem;color:var(--muted);margin-top:4px">
            ${esc(p.brand)} · ${esc(p.category)} · ${esc(p.condition)} · ${stockBadge}
          </div>
          ${specsInfo ? `<div style="\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x2e\x37\x38\x72\x65\x6d\x3b\x63\x6f\x6c\x6f\x72\x3a\x76\x61\x72\x28\x2d\x2d\x6d\x75\x74\x65\x64\x29\x3b\x6d\x61\x72\x67\x69\x6e\x2d\x74\x6f\x70\x3a\x33\x70\x78">${specsInfo}</div>` : ''}
        </span>
        <b class="admin-row__price" style="font-size:1.05rem;white-space:nowrap">${money(p.price)}</b>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn btn--soft btn--sm" data-edit-product="${esc(p.id)}"
            style="color:var(--brand-600);padding:6px 12px;gap:4px">
            ✏️ Edit
          </button>
          <button class="btn btn--soft btn--sm" data-del-product="${esc(p.id)}"
            style="color:var(--rose);padding:6px 12px;gap:4px">
            ${icon('trash', 15)} Delete
          </button>
        </div>
      </div>`;
  }).join('');
  box.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x65\x64\x69\x74\x2d\x70\x72\x6f\x64\x75\x63\x74\x5d').forEach(btn => {
    btn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      const id = btn.dataset.editProduct;
      startEditProduct(id);
    });
  });
  box.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x64\x65\x6c\x2d\x70\x72\x6f\x64\x75\x63\x74\x5d').forEach(btn => {
    btn.addEventListener('\x63\x6c\x69\x63\x6b', async () => {
      const id = btn.dataset.delProduct;
      const prod = productById(id);
      const name = prod ? prod.title : id;
      if (!confirm(`Are you sure you want to delete "${name}"? It will be removed from the store and marked Deleted in the Google Sheet.`)) return;
      btn.disabled = true;
      btn.textContent = '\x44\x65\x6c\x65\x74\x69\x6e\x67\x2e\x2e\x2e';
      if (window.SheetEndpoint) {
        await window.SheetEndpoint.deleteProduct(id);
      } else {
        deleteAnyProduct(id);
      }
      toast(`Product "${name}" removed & synced to Sheet`, '\x74\x72\x61\x73\x68');
      renderAdminProductsList();
    });
  });
}
async function renderAdminOrdersList() {
  const tbody = document.getElementById('\x6f\x72\x64\x65\x72\x73\x54\x61\x62\x6c\x65\x42\x6f\x64\x79');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:24px">Fetching orders from Google Sheet...</td></tr>`;
  let orders = getOrders();
  if (window.SheetEndpoint) {
    try {
      const sheetOrders = await window.SheetEndpoint.fetchOrders();
      if (sheetOrders && sheetOrders.length) orders = sheetOrders;
    } catch (_) {}
  }
  const countEl = document.getElementById('\x61\x64\x6d\x69\x6e\x4f\x72\x64\x65\x72\x73\x43\x6f\x75\x6e\x74');
  const revEl = document.getElementById('\x61\x64\x6d\x69\x6e\x4f\x72\x64\x65\x72\x73\x52\x65\x76\x65\x6e\x75\x65');
  const pendEl = document.getElementById('\x61\x64\x6d\x69\x6e\x50\x65\x6e\x64\x69\x6e\x67\x43\x6f\x75\x6e\x74');
  const tabCount = document.getElementById('\x74\x61\x62\x4f\x72\x64\x65\x72\x43\x6f\x75\x6e\x74');
  if (countEl) countEl.textContent = orders.length;
  if (tabCount) tabCount.textContent = orders.length;
  if (revEl) revEl.textContent = money(orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0));
  const pending = orders.filter(o => String(o.status || '').toLowerCase() === '\x70\x65\x6e\x64\x69\x6e\x67').length;
  if (pendEl) pendEl.textContent = pending;
  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;color:var(--muted);padding:36px">
          No orders placed yet. Place an order from the shop to see it here and in Google Sheets.
        </td>
      </tr>`;
    return;
  }
  tbody.innerHTML = orders.map(o => {
    const status = String(o.status || '\x50\x65\x6e\x64\x69\x6e\x67').trim();
    const sLower = status.toLowerCase();
    const isPending = sLower === '\x70\x65\x6e\x64\x69\x6e\x67';
    const isConfirmed = sLower === '\x63\x6f\x6e\x66\x69\x72\x6d\x65\x64';
    const isCancel = sLower === '\x63\x61\x6e\x63\x65\x6c' || sLower === '\x63\x61\x6e\x63\x65\x6c\x6c\x65\x64';
    const isDelivered = sLower === '\x64\x65\x6c\x69\x76\x65\x72\x65\x64';
    const badgeClass = {
      pending: '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x70\x65\x6e\x64\x69\x6e\x67',
      confirmed: '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x63\x6f\x6e\x66\x69\x72\x6d\x65\x64',
      cancel: '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x63\x61\x6e\x63\x65\x6c\x6c\x65\x64',
      cancelled: '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x63\x61\x6e\x63\x65\x6c\x6c\x65\x64',
      delivered: '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x64\x65\x6c\x69\x76\x65\x72\x65\x64'
    }[sLower] || '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x70\x65\x6e\x64\x69\x6e\x67';
    return `
      <tr>
        <td>
          <b>${esc(o.ref)}</b>
          <div style="margin-top:2px"><span class="badge-sheet-live" style="font-size:.65rem;padding:1px 6px">Cols AA–AM</span></div>
        </td>
        <td><small style="color:var(--muted);white-space:nowrap">${esc(orderDate(o.placedAt))}</small></td>
        <td>
          <b>${esc(o.name)}</b>
          ${o.email ? `<small style="\x64\x69\x73\x70\x6c\x61\x79\x3a\x62\x6c\x6f\x63\x6b\x3b\x63\x6f\x6c\x6f\x72\x3a\x76\x61\x72\x28\x2d\x2d\x6d\x75\x74\x65\x64\x29">${esc(o.email)}</small>` : ''}
        </td>
        <td>
          <a href="tel:${esc(o.phone)}" style="color:var(--brand-600);font-weight:600">${esc(o.phone)}</a>
        </td>
        <td>
          <span>${esc(o.address || o.area || '')}</span>
          <small style="display:block;color:var(--muted)">${esc(o.city || 'Dhaka')}</small>
        </td>
        <td><small>${esc(o.payment || 'Cash on delivery')}</small></td>
        <td>${esc(o.items || 1)}</td>
        <td><b>${money(o.total || 0)}</b></td>
        <td>
          <span class="status-badge ${badgeClass}">${esc(status)}</span>
        </td>
        <td style="white-space:nowrap">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap">
            ${isPending ? `
              <button class="\x62\x74\x6e\x20\x62\x74\x6e\x2d\x2d\x70\x72\x69\x6d\x61\x72\x79\x20\x62\x74\x6e\x2d\x2d\x73\x6d" data-confirm-order="\x24\x7b\x65\x73\x63\x28\x6f\x2e\x72\x65\x66\x29\x7d" style="\x70\x61\x64\x64\x69\x6e\x67\x3a\x34\x70\x78\x20\x39\x70\x78\x3b\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x2e\x37\x36\x72\x65\x6d" title="\x43\x6f\x6e\x66\x69\x72\x6d\x20\x74\x68\x69\x73\x20\x6f\x72\x64\x65\x72">
                Confirm
              </button>
              <button class="\x62\x74\x6e\x20\x62\x74\x6e\x2d\x2d\x73\x6f\x66\x74\x20\x62\x74\x6e\x2d\x2d\x73\x6d" data-cancel-order="\x24\x7b\x65\x73\x63\x28\x6f\x2e\x72\x65\x66\x29\x7d" style="\x70\x61\x64\x64\x69\x6e\x67\x3a\x34\x70\x78\x20\x39\x70\x78\x3b\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x2e\x37\x36\x72\x65\x6d\x3b\x63\x6f\x6c\x6f\x72\x3a\x23\x65\x31\x31\x64\x34\x38\x3b\x62\x6f\x72\x64\x65\x72\x2d\x63\x6f\x6c\x6f\x72\x3a\x72\x67\x62\x61\x28\x32\x34\x34\x2c\x36\x33\x2c\x39\x34\x2c\x2e\x33\x29" title="\x43\x61\x6e\x63\x65\x6c\x20\x74\x68\x69\x73\x20\x6f\x72\x64\x65\x72">
                Cancel
              </button>
            ` : ''}
            ${isConfirmed ? `
              <button class="\x62\x74\x6e\x20\x62\x74\x6e\x2d\x2d\x70\x72\x69\x6d\x61\x72\x79\x20\x62\x74\x6e\x2d\x2d\x73\x6d" data-deliver-order="\x24\x7b\x65\x73\x63\x28\x6f\x2e\x72\x65\x66\x29\x7d" style="\x70\x61\x64\x64\x69\x6e\x67\x3a\x34\x70\x78\x20\x39\x70\x78\x3b\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x2e\x37\x36\x72\x65\x6d\x3b\x62\x61\x63\x6b\x67\x72\x6f\x75\x6e\x64\x3a\x23\x30\x35\x39\x36\x36\x39" title="\x4d\x61\x72\x6b\x20\x61\x73\x20\x44\x65\x6c\x69\x76\x65\x72\x65\x64">
                Deliver
              </button>
              <button class="\x62\x74\x6e\x20\x62\x74\x6e\x2d\x2d\x73\x6f\x66\x74\x20\x62\x74\x6e\x2d\x2d\x73\x6d" data-cancel-order="\x24\x7b\x65\x73\x63\x28\x6f\x2e\x72\x65\x66\x29\x7d" style="\x70\x61\x64\x64\x69\x6e\x67\x3a\x34\x70\x78\x20\x39\x70\x78\x3b\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x2e\x37\x36\x72\x65\x6d\x3b\x63\x6f\x6c\x6f\x72\x3a\x23\x65\x31\x31\x64\x34\x38\x3b\x62\x6f\x72\x64\x65\x72\x2d\x63\x6f\x6c\x6f\x72\x3a\x72\x67\x62\x61\x28\x32\x34\x34\x2c\x36\x33\x2c\x39\x34\x2c\x2e\x33\x29" title="\x43\x61\x6e\x63\x65\x6c\x20\x74\x68\x69\x73\x20\x6f\x72\x64\x65\x72">
                Cancel
              </button>
            ` : ''}
            <select class="input" data-change-status="${esc(o.ref)}" style="display:inline-block;width:auto;padding:4px 8px;font-size:.76rem">
              <option value="Pending" ${isPending ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${isConfirmed ? 'selected' : ''}>Confirmed</option>
              <option value="Cancelled" ${isCancel ? 'selected' : ''}>Cancelled</option>
              <option value="Delivered" ${isDelivered ? 'selected' : ''}>Delivered</option>
            </select>
          </div>
        </td>
      </tr>`;
  }).join('');
  tbody.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x63\x6f\x6e\x66\x69\x72\x6d\x2d\x6f\x72\x64\x65\x72\x5d').forEach(btn => {
    btn.addEventListener('\x63\x6c\x69\x63\x6b', async () => {
      const ref = btn.dataset.confirmOrder;
      btn.disabled = true;
      btn.textContent = '\x43\x6f\x6e\x66\x69\x72\x6d\x69\x6e\x67\x2e\x2e\x2e';
      if (window.SheetEndpoint) {
        await window.SheetEndpoint.updateOrderStatus(ref, '\x43\x6f\x6e\x66\x69\x72\x6d\x65\x64');
      }
      toast(`Order ${ref} confirmed and synced to Google Sheet!`, '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
      renderAdminOrdersList();
    });
  });
  tbody.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x63\x61\x6e\x63\x65\x6c\x2d\x6f\x72\x64\x65\x72\x5d').forEach(btn => {
    btn.addEventListener('\x63\x6c\x69\x63\x6b', async () => {
      const ref = btn.dataset.cancelOrder;
      if (!confirm(`Are you sure you want to cancel order ${ref}?`)) return;
      btn.disabled = true;
      btn.textContent = '\x43\x61\x6e\x63\x65\x6c\x6c\x69\x6e\x67\x2e\x2e\x2e';
      if (window.SheetEndpoint) {
        await window.SheetEndpoint.updateOrderStatus(ref, '\x43\x61\x6e\x63\x65\x6c\x6c\x65\x64');
      }
      toast(`Order ${ref} cancelled and synced to Google Sheet!`, '\x63\x6c\x6f\x73\x65');
      renderAdminOrdersList();
    });
  });
  tbody.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x64\x65\x6c\x69\x76\x65\x72\x2d\x6f\x72\x64\x65\x72\x5d').forEach(btn => {
    btn.addEventListener('\x63\x6c\x69\x63\x6b', async () => {
      const ref = btn.dataset.deliverOrder;
      btn.disabled = true;
      btn.textContent = '\x55\x70\x64\x61\x74\x69\x6e\x67\x2e\x2e\x2e';
      if (window.SheetEndpoint) {
        await window.SheetEndpoint.updateOrderStatus(ref, '\x44\x65\x6c\x69\x76\x65\x72\x65\x64');
      }
      toast(`Order ${ref} marked as Delivered!`, '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
      renderAdminOrdersList();
    });
  });
  tbody.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x63\x68\x61\x6e\x67\x65\x2d\x73\x74\x61\x74\x75\x73\x5d').forEach(sel => {
    sel.addEventListener('\x63\x68\x61\x6e\x67\x65', async () => {
      const ref = sel.dataset.changeStatus;
      const newStatus = sel.value;
      if (window.SheetEndpoint) {
        await window.SheetEndpoint.updateOrderStatus(ref, newStatus);
      }
      toast(`Order ${ref} status updated to ${newStatus}`, '\x63\x68\x65\x63\x6b');
      renderAdminOrdersList();
    });
  });
}
async function renderAdminUsersList() {
  const tbody = document.getElementById('\x75\x73\x65\x72\x73\x54\x61\x62\x6c\x65\x42\x6f\x64\x79');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:24px">Fetching users from Google Sheet...</td></tr>`;
  let users = [];
  if (window.SheetEndpoint) {
    try {
      users = await window.SheetEndpoint.fetchUsers();
    } catch (_) {}
  }
  if (!users || !users.length) {
    users = readStore('\x6d\x67\x2e\x75\x73\x65\x72\x73\x2e\x63\x61\x63\x68\x65\x2e\x76\x31', [
      { id: '\x55\x53\x52\x2d\x31\x30\x30\x31', registeredAt: '\x32\x30\x32\x36\x2d\x30\x31\x2d\x31\x35\x20\x31\x30\x3a\x33\x30\x3a\x30\x30', name: '\x54\x61\x6e\x76\x69\x72\x20\x41\x68\x6d\x65\x64', email: '\x74\x61\x6e\x76\x69\x72\x2e\x61\x68\x6d\x65\x64\x40\x65\x78\x61\x6d\x70\x6c\x65\x2e\x63\x6f\x6d', phone: '\x38\x38\x30\x31\x37\x31\x31\x32\x32\x33\x33\x34\x34', status: '\x41\x63\x74\x69\x76\x65' },
      { id: '\x55\x53\x52\x2d\x31\x30\x30\x32', registeredAt: '\x32\x30\x32\x36\x2d\x30\x32\x2d\x30\x31\x20\x31\x34\x3a\x31\x35\x3a\x30\x30', name: '\x4e\x75\x73\x72\x61\x74\x20\x4a\x61\x68\x61\x6e', email: '\x6e\x75\x73\x72\x61\x74\x2e\x6a\x61\x68\x61\x6e\x40\x65\x78\x61\x6d\x70\x6c\x65\x2e\x63\x6f\x6d', phone: '\x38\x38\x30\x31\x38\x31\x39\x38\x37\x36\x35\x34\x33', status: '\x49\x6e\x61\x63\x74\x69\x76\x65' },
      { id: '\x55\x53\x52\x2d\x31\x30\x30\x33', registeredAt: '\x32\x30\x32\x36\x2d\x30\x32\x2d\x32\x30\x20\x30\x39\x3a\x34\x35\x3a\x30\x30', name: '\x52\x61\x6b\x69\x62\x75\x6c\x20\x48\x61\x73\x61\x6e', email: '\x72\x61\x6b\x69\x62\x75\x6c\x2e\x68\x40\x65\x78\x61\x6d\x70\x6c\x65\x2e\x63\x6f\x6d', phone: '\x38\x38\x30\x31\x39\x31\x32\x33\x34\x35\x36\x37\x38', status: '\x49\x6e\x61\x63\x74\x69\x76\x65' }
    ]);
  }
  const totalEl = document.getElementById('\x61\x64\x6d\x69\x6e\x55\x73\x65\x72\x73\x54\x6f\x74\x61\x6c');
  const activeEl = document.getElementById('\x61\x64\x6d\x69\x6e\x55\x73\x65\x72\x73\x41\x63\x74\x69\x76\x65');
  const inactiveEl = document.getElementById('\x61\x64\x6d\x69\x6e\x55\x73\x65\x72\x73\x49\x6e\x61\x63\x74\x69\x76\x65');
  const tabBadge = document.getElementById('\x74\x61\x62\x55\x73\x65\x72\x43\x6f\x75\x6e\x74');
  if (totalEl) totalEl.textContent = users.length;
  if (tabBadge) tabBadge.textContent = users.length;
  const activeCount = users.filter(u => String(u.status || '\x41\x63\x74\x69\x76\x65').toLowerCase() === '\x61\x63\x74\x69\x76\x65').length;
  if (activeEl) activeEl.textContent = activeCount;
  if (inactiveEl) inactiveEl.textContent = users.length - activeCount;
  if (!users.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;color:var(--muted);padding:36px">
          No registered customer accounts yet. When users register on the website, they will appear here and in Google Sheet Columns A–G.
        </td>
      </tr>`;
    return;
  }
  tbody.innerHTML = users.map(u => {
    const status = String(u.status || '\x41\x63\x74\x69\x76\x65').trim();
    const isActive = status.toLowerCase() === '\x61\x63\x74\x69\x76\x65';
    const badgeClass = isActive ? '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x63\x6f\x6e\x66\x69\x72\x6d\x65\x64' : '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x63\x61\x6e\x63\x65\x6c\x6c\x65\x64';
    return `
      <tr>
        <td>
          <b>${esc(u.id || '—')}</b>
          <div style="margin-top:2px"><span class="badge-sheet-live" style="font-size:.65rem;padding:1px 6px">Cols A–G</span></div>
        </td>
        <td><small style="color:var(--muted);white-space:nowrap">${esc(u.registeredAt || '—')}</small></td>
        <td><b>${esc(u.name || 'User')}</b></td>
        <td><a href="mailto:${esc(u.email)}" style="color:var(--brand-600);font-weight:600">${esc(u.email)}</a></td>
        <td><a href="tel:${esc(u.phone)}" style="color:var(--ink)">${esc(u.phone || '—')}</a></td>
        <td>
          <span class="status-badge ${badgeClass}" style="padding:2px 10px;font-size:.78rem">
            ${esc(status)}
          </span>
        </td>
        <td style="white-space:nowrap">
          <select class="input" data-user-status="${esc(u.email)}" data-user-id="${esc(u.id)}" style="display:inline-block;width:auto;padding:5px 8px;font-size:.8rem">
            <option value="Active" ${status.toLowerCase() === 'active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${status.toLowerCase() === 'inactive' ? 'selected' : ''}>Inactive</option>
            <option value="Suspended" ${status.toLowerCase() === 'suspended' ? 'selected' : ''}>Suspended</option>
          </select>
        </td>
      </tr>`;
  }).join('');
  tbody.querySelectorAll('\x5b\x64\x61\x74\x61\x2d\x75\x73\x65\x72\x2d\x73\x74\x61\x74\x75\x73\x5d').forEach(sel => {
    sel.addEventListener('\x63\x68\x61\x6e\x67\x65', async () => {
      const email = sel.dataset.userStatus;
      const userId = sel.dataset.userId;
      const newStatus = sel.value;
      sel.disabled = true;
      toast(`Updating ${email || userId} to ${newStatus}...`, '\x63\x68\x65\x63\x6b');
      if (window.SheetEndpoint) {
        const res = await window.SheetEndpoint.updateUserStatus(email, newStatus, userId);
        if (res && res.ok) {
          toast(`User ${email || userId} status updated to ${newStatus} in Google Sheet!`, '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
        } else {
          toast(res && res.error ? `Status: ${res.error}` : `User status changed to ${newStatus}`, '\x63\x68\x65\x63\x6b');
        }
      }
      renderAdminUsersList();
    });
  });
}
function initSheetSettings() {
  const urlInput = document.getElementById('\x63\x66\x67\x53\x68\x65\x65\x74\x55\x72\x6c');
  const saveBtn = document.getElementById('\x73\x61\x76\x65\x53\x68\x65\x65\x74\x55\x72\x6c\x42\x74\x6e');
  const testBtn = document.getElementById('\x74\x65\x73\x74\x53\x68\x65\x65\x74\x43\x6f\x6e\x6e\x42\x74\x6e');
  const output = document.getElementById('\x73\x68\x65\x65\x74\x54\x65\x73\x74\x4f\x75\x74\x70\x75\x74');
  if (urlInput && window.SheetEndpoint) {
    urlInput.value = window.SheetEndpoint.getUrl();
  }
  if (saveBtn) {
    saveBtn.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      const newUrl = (urlInput.value || '').trim();
      if (window.SheetEndpoint) {
        window.SheetEndpoint.url = newUrl;
        try { localStorage.setItem('\x6d\x67\x2e\x73\x68\x65\x65\x74\x2e\x75\x72\x6c', newUrl); } catch (_) {}
      }
      updateConnectionPill();
      toast('\x41\x70\x70\x73\x20\x53\x63\x72\x69\x70\x74\x20\x55\x52\x4c\x20\x73\x61\x76\x65\x64', '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
    });
  }
  if (testBtn) {
    testBtn.addEventListener('\x63\x6c\x69\x63\x6b', async () => {
      testBtn.disabled = true;
      testBtn.textContent = '\x54\x65\x73\x74\x69\x6e\x67\x20\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x2e\x2e\x2e';
      if (output) output.style.display = '\x6e\x6f\x6e\x65';
      if (window.SheetEndpoint) {
        const res = await window.SheetEndpoint.get('\x70\x69\x6e\x67');
        testBtn.disabled = false;
        testBtn.textContent = '\x54\x65\x73\x74\x20\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e';
        if (output) {
          output.style.display = '\x62\x6c\x6f\x63\x6b';
          if (res.ok) {
            output.style.background = '\x72\x67\x62\x61\x28\x31\x36\x2c\x20\x31\x38\x35\x2c\x20\x31\x32\x39\x2c\x20\x2e\x31\x35\x29';
            output.style.color = '\x23\x30\x35\x39\x36\x36\x39';
            output.innerHTML = `<b>Connection Successful!</b><br>${esc(res.message || 'Google Sheet endpoint responded properly.')}`;
          } else {
            output.style.background = '\x72\x67\x62\x61\x28\x32\x34\x34\x2c\x20\x36\x33\x2c\x20\x39\x34\x2c\x20\x2e\x31\x35\x29';
            output.style.color = '\x23\x65\x31\x31\x64\x34\x38';
            output.innerHTML = `<b>Connection Failed:</b> ${esc(res.error || 'Check deployment URL.')}`;
          }
        }
      }
    });
  }
  const refreshOrders = document.getElementById('\x72\x65\x66\x72\x65\x73\x68\x4f\x72\x64\x65\x72\x73\x42\x74\x6e');
  if (refreshOrders) {
    refreshOrders.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      renderAdminOrdersList();
      toast('\x52\x65\x66\x72\x65\x73\x68\x65\x64\x20\x6f\x72\x64\x65\x72\x73\x20\x6c\x69\x73\x74', '\x63\x68\x65\x63\x6b');
    });
  }
  const refreshProducts = document.getElementById('\x72\x65\x66\x72\x65\x73\x68\x50\x72\x6f\x64\x75\x63\x74\x73\x42\x74\x6e');
  if (refreshProducts) {
    refreshProducts.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      renderAdminProductsList();
      toast('\x52\x65\x66\x72\x65\x73\x68\x65\x64\x20\x70\x72\x6f\x64\x75\x63\x74\x73\x20\x63\x61\x74\x61\x6c\x6f\x67\x75\x65', '\x63\x68\x65\x63\x6b');
    });
  }
  const refreshUsers = document.getElementById('\x72\x65\x66\x72\x65\x73\x68\x55\x73\x65\x72\x73\x42\x74\x6e');
  if (refreshUsers) {
    refreshUsers.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      renderAdminUsersList();
      toast('\x52\x65\x66\x72\x65\x73\x68\x65\x64\x20\x72\x65\x67\x69\x73\x74\x65\x72\x65\x64\x20\x75\x73\x65\x72\x73\x20\x66\x72\x6f\x6d\x20\x73\x68\x65\x65\x74', '\x63\x68\x65\x63\x6b');
    });
  }
  const seedProducts = document.getElementById('\x73\x65\x65\x64\x50\x72\x6f\x64\x75\x63\x74\x73\x42\x74\x6e');
  if (seedProducts) {
    seedProducts.addEventListener('\x63\x6c\x69\x63\x6b', async () => {
      const prods = allProducts();
      if (!confirm(`Are you sure you want to upload all ${prods.length} products to Columns I–Y of your Google Sheet?`)) return;
      seedProducts.disabled = true;
      seedProducts.textContent = '\x55\x70\x6c\x6f\x61\x64\x69\x6e\x67\x20\x74\x6f\x20\x53\x68\x65\x65\x74\x2e\x2e\x2e';
      if (window.SheetEndpoint) {
        const res = await window.SheetEndpoint.seedProducts(prods);
        seedProducts.disabled = false;
        seedProducts.textContent = '\ud83d\udce4\x20\x55\x70\x6c\x6f\x61\x64\x20\x41\x6c\x6c\x20\x74\x6f\x20\x53\x68\x65\x65\x74';
        if (res.ok) {
          toast(`Uploaded ${prods.length} products to Google Sheet!`, '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
        } else {
          toast(res.error || '\x55\x70\x6c\x6f\x61\x64\x20\x66\x61\x69\x6c\x65\x64\x2c\x20\x76\x65\x72\x69\x66\x79\x20\x53\x68\x65\x65\x74\x20\x55\x52\x4c', '\x63\x6c\x6f\x73\x65');
        }
      } else {
        seedProducts.disabled = false;
        seedProducts.textContent = '\ud83d\udce4\x20\x55\x70\x6c\x6f\x61\x64\x20\x41\x6c\x6c\x20\x74\x6f\x20\x53\x68\x65\x65\x74';
        toast('\x53\x68\x65\x65\x74\x20\x65\x6e\x64\x70\x6f\x69\x6e\x74\x20\x6e\x6f\x74\x20\x72\x65\x61\x64\x79', '\x63\x6c\x6f\x73\x65');
      }
    });
  }
}
async function updateConnectionPill() {
  const pill = document.getElementById('\x73\x68\x65\x65\x74\x53\x74\x61\x74\x75\x73\x50\x69\x6c\x6c');
  const monitor = document.getElementById('\x73\x68\x65\x65\x74\x53\x79\x6e\x63\x4d\x6f\x6e\x69\x74\x6f\x72');
  const monitorBadge = document.getElementById('\x73\x79\x6e\x63\x4d\x6f\x6e\x69\x74\x6f\x72\x42\x61\x64\x67\x65');
  const latencyText = document.getElementById('\x73\x79\x6e\x63\x4c\x61\x74\x65\x6e\x63\x79\x54\x65\x78\x74');
  const prodCountEl = document.getElementById('\x6d\x6f\x6e\x69\x74\x6f\x72\x50\x72\x6f\x64\x43\x6f\x75\x6e\x74');
  const orderCountEl = document.getElementById('\x6d\x6f\x6e\x69\x74\x6f\x72\x4f\x72\x64\x65\x72\x43\x6f\x75\x6e\x74');
  const userCountEl = document.getElementById('\x6d\x6f\x6e\x69\x74\x6f\x72\x55\x73\x65\x72\x43\x6f\x75\x6e\x74');
  if (pill && !pill.dataset.wired) {
    pill.dataset.wired = '\x74\x72\x75\x65';
    pill.addEventListener('\x63\x6c\x69\x63\x6b', () => switchTab('\x73\x68\x65\x65\x74\x53\x65\x74\x74\x69\x6e\x67\x73'));
  }
  const syncTitle = document.getElementById('\x73\x79\x6e\x63\x4d\x6f\x6e\x69\x74\x6f\x72\x54\x69\x74\x6c\x65');
  if (syncTitle && !syncTitle.dataset.wired) {
    syncTitle.dataset.wired = '\x74\x72\x75\x65';
    syncTitle.style.cursor = '\x70\x6f\x69\x6e\x74\x65\x72';
    syncTitle.addEventListener('\x63\x6c\x69\x63\x6b', () => switchTab('\x73\x68\x65\x65\x74\x53\x65\x74\x74\x69\x6e\x67\x73'));
  }
  const prods = allProducts();
  const orders = readStore('\x6d\x67\x2e\x6f\x72\x64\x65\x72\x73\x2e\x76\x31', []);
  const users = readStore('\x6d\x67\x2e\x75\x73\x65\x72\x73\x2e\x76\x31', readStore('\x6d\x67\x2e\x75\x73\x65\x72\x73\x2e\x63\x61\x63\x68\x65\x2e\x76\x31', []));
  if (prodCountEl) prodCountEl.textContent = prods.length;
  if (orderCountEl) orderCountEl.textContent = orders.length;
  if (userCountEl) userCountEl.textContent = users.length;
  if (window.SheetEndpoint && window.SheetEndpoint.isReady()) {
    if (pill) {
      pill.className = '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x20\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x63\x6f\x6e\x66\x69\x72\x6d\x65\x64';
      pill.textContent = '\ud83d\udfe2\x20\x53\x68\x65\x65\x74\x20\x43\x6f\x6e\x6e\x65\x63\x74\x65\x64';
    }
    if (monitor) monitor.classList.remove('\x69\x73\x2d\x6f\x66\x66\x6c\x69\x6e\x65');
    if (monitorBadge) {
      monitorBadge.className = '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x20\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x63\x6f\x6e\x66\x69\x72\x6d\x65\x64';
      monitorBadge.textContent = '\ud83d\udfe2\x20\x4c\x69\x76\x65\x20\x43\x6f\x6e\x6e\x65\x63\x74\x65\x64';
    }
    try {
      const pingRes = await window.SheetEndpoint.ping();
      if (pingRes && pingRes.ok) {
        if (latencyText) latencyText.textContent = `${pingRes.latency}ms (Fast)`;
        if (pill) pill.textContent = `🟢 Sheet Connected (${pingRes.latency}ms)`;
      } else {
        if (latencyText) latencyText.textContent = '\x43\x6f\x6e\x66\x69\x67\x75\x72\x65\x64\x20\x28\x41\x63\x74\x69\x76\x65\x29';
      }
    } catch (_) {
      if (latencyText) latencyText.textContent = '\x4f\x6e\x6c\x69\x6e\x65';
    }
  } else {
    if (pill) {
      pill.className = '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x20\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x70\x65\x6e\x64\x69\x6e\x67';
      pill.textContent = '\u26aa\x20\x4c\x6f\x63\x61\x6c\x20\x43\x61\x63\x68\x65\x20\x4d\x6f\x64\x65';
    }
    if (monitor) monitor.classList.add('\x69\x73\x2d\x6f\x66\x66\x6c\x69\x6e\x65');
    if (monitorBadge) {
      monitorBadge.className = '\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x20\x73\x74\x61\x74\x75\x73\x2d\x62\x61\x64\x67\x65\x2d\x2d\x70\x65\x6e\x64\x69\x6e\x67';
      monitorBadge.textContent = '\u26aa\x20\x4c\x6f\x63\x61\x6c\x20\x43\x61\x63\x68\x65\x20\x4d\x6f\x64\x65';
    }
    if (latencyText) latencyText.textContent = '\x4f\x66\x66\x6c\x69\x6e\x65\x20\x2f\x20\x4c\x6f\x63\x61\x6c';
  }
  const monitorSyncBtn = document.getElementById('\x6d\x6f\x6e\x69\x74\x6f\x72\x53\x79\x6e\x63\x4e\x6f\x77\x42\x74\x6e');
  if (monitorSyncBtn && !monitorSyncBtn.dataset.wired) {
    monitorSyncBtn.dataset.wired = '\x74\x72\x75\x65';
    monitorSyncBtn.addEventListener('\x63\x6c\x69\x63\x6b', async () => {
      monitorSyncBtn.disabled = true;
      monitorSyncBtn.textContent = '\x53\x79\x6e\x63\x69\x6e\x67\x2e\x2e\x2e';
      toast('\x54\x65\x73\x74\x69\x6e\x67\x20\x47\x6f\x6f\x67\x6c\x65\x20\x53\x68\x65\x65\x74\x20\x41\x50\x49\x20\x61\x6e\x64\x20\x66\x65\x74\x63\x68\x69\x6e\x67\x20\x6c\x61\x74\x65\x73\x74\x20\x64\x61\x74\x61\x2e\x2e\x2e', '\x63\x68\x65\x63\x6b');
      if (window.SheetEndpoint && window.SheetEndpoint.isReady()) {
        const pingRes = await window.SheetEndpoint.ping();
        await renderAdminProductsList();
        await renderAdminOrdersList();
        await renderAdminUsersList();
        const pCount = allProducts().length;
        const oCount = readStore('\x6d\x67\x2e\x6f\x72\x64\x65\x72\x73\x2e\x76\x31', []).length;
        const uCount = readStore('\x6d\x67\x2e\x75\x73\x65\x72\x73\x2e\x76\x31', readStore('\x6d\x67\x2e\x75\x73\x65\x72\x73\x2e\x63\x61\x63\x68\x65\x2e\x76\x31', [])).length;
        if (prodCountEl) prodCountEl.textContent = pCount;
        if (orderCountEl) orderCountEl.textContent = oCount;
        if (userCountEl) userCountEl.textContent = uCount;
        monitorSyncBtn.disabled = false;
        monitorSyncBtn.textContent = '\ud83d\udd04\x20\x43\x68\x65\x63\x6b\x20\x26\x20\x53\x79\x6e\x63\x20\x4e\x6f\x77';
        if (pingRes && pingRes.ok) {
          toast(`Sheet API Live (${pingRes.latency}ms)! Synced ${pCount} products, ${oCount} orders, ${uCount} users.`, '\x63\x68\x65\x63\x6b\x43\x69\x72\x63\x6c\x65');
        } else {
          toast('\x53\x68\x65\x65\x74\x20\x65\x6e\x64\x70\x6f\x69\x6e\x74\x20\x73\x79\x6e\x63\x68\x72\x6f\x6e\x69\x7a\x65\x64\x20\x69\x6e\x20\x6c\x6f\x63\x61\x6c\x20\x63\x61\x63\x68\x65\x20\x6d\x6f\x64\x65\x2e', '\x63\x68\x65\x63\x6b');
        }
      } else {
        await renderAdminProductsList();
        await renderAdminOrdersList();
        await renderAdminUsersList();
        monitorSyncBtn.disabled = false;
        monitorSyncBtn.textContent = '\ud83d\udd04\x20\x43\x68\x65\x63\x6b\x20\x26\x20\x53\x79\x6e\x63\x20\x4e\x6f\x77';
        toast('\x4c\x6f\x63\x61\x6c\x20\x63\x61\x63\x68\x65\x20\x72\x65\x66\x72\x65\x73\x68\x65\x64\x2e\x20\x43\x6f\x6e\x66\x69\x67\x75\x72\x65\x20\x41\x70\x70\x73\x20\x53\x63\x72\x69\x70\x74\x20\x55\x52\x4c\x20\x74\x6f\x20\x63\x6f\x6e\x6e\x65\x63\x74\x20\x53\x68\x65\x65\x74\x2e', '\x63\x68\x65\x63\x6b');
      }
    });
  }
}
function initAdmin() {
  initAdminAuth();
  initAdminTabs();
  initProductForm();
  initAdminPhotos();
  initSheetSettings();
  try {
    const savedUrl = localStorage.getItem('\x6d\x67\x2e\x73\x68\x65\x65\x74\x2e\x75\x72\x6c');
    if (savedUrl && window.SheetEndpoint) {
      window.SheetEndpoint.url = savedUrl;
    }
  } catch (_) {}
  updateAdminView();
}
document.addEventListener('\x44\x4f\x4d\x43\x6f\x6e\x74\x65\x6e\x74\x4c\x6f\x61\x64\x65\x64', initAdmin);