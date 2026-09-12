/* Mobile Gallery v1.0.0 - Production Protected Build. (c) 2026 Mobile Gallery Inc. All Rights Reserved. Reverse-engineering, redistribution or copying is prohibited. */
class Optimization {
  static DEFAULT_CONFIG = {
    maxWidth: 720,
    maxHeight: 720,
    initialQuality: 0.72,
    minQuality: 0.48,
    targetMaxKB: 60,
    preferredFormat: '\x69\x6d\x61\x67\x65\x2f\x77\x65\x62\x70',
    fallbackFormat: '\x69\x6d\x61\x67\x65\x2f\x6a\x70\x65\x67'
  };
  constructor(config = {}) {
    this.config = { ...Optimization.DEFAULT_CONFIG, ...config };
  }
  static async photo(photo, customOptions = {}) {
    const instance = new Optimization(customOptions);
    return instance.optimizePhoto(photo);
  }
  static async optimize(photo, customOptions = {}) {
    return Optimization.photo(photo, customOptions);
  }
  static async batch(photos, customOptions = {}) {
    if (!Array.isArray(photos) || photos.length === 0) return [];
    return Promise.all(photos.map(p => Optimization.photo(p, customOptions)));
  }
  async optimizePhoto(photo) {
    if (!photo) {
      throw new Error('\x4f\x70\x74\x69\x6d\x69\x7a\x61\x74\x69\x6f\x6e\x3a\x20\x4e\x6f\x20\x70\x68\x6f\x74\x6f\x20\x70\x72\x6f\x76\x69\x64\x65\x64\x20\x74\x6f\x20\x6f\x70\x74\x69\x6d\x69\x7a\x65\x2e');
    }
    const originalBytes = photo.size || (typeof photo === '\x73\x74\x72\x69\x6e\x67' ? Optimization.calcBase64Bytes(photo) : 0);
    const img = await Optimization.loadImage(photo);
    const compressed = await this.multiPassCompress(img);
    const optimizedBytes = Optimization.calcBase64Bytes(compressed.dataUrl);
    const savingsPercent = originalBytes > 0
      ? Math.max(0, Math.round(((originalBytes - optimizedBytes) / originalBytes) * 100))
      : 0;
    return {
      dataUrl: compressed.dataUrl,
      originalBytes,
      optimizedBytes,
      savingsPercent,
      width: compressed.width,
      height: compressed.height,
      mimeType: compressed.mimeType
    };
  }
  static loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('\x4f\x70\x74\x69\x6d\x69\x7a\x61\x74\x69\x6f\x6e\x3a\x20\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x64\x65\x63\x6f\x64\x65\x20\x69\x6d\x61\x67\x65\x2e'));
      if (typeof source === '\x73\x74\x72\x69\x6e\x67') {
        img.src = source;
      } else if (source instanceof Blob || source instanceof File) {
        const reader = new FileReader();
        reader.onload = e => {
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('\x4f\x70\x74\x69\x6d\x69\x7a\x61\x74\x69\x6f\x6e\x3a\x20\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x72\x65\x61\x64\x20\x66\x69\x6c\x65\x2e'));
        reader.readAsDataURL(source);
      } else {
        reject(new Error('\x4f\x70\x74\x69\x6d\x69\x7a\x61\x74\x69\x6f\x6e\x3a\x20\x55\x6e\x73\x75\x70\x70\x6f\x72\x74\x65\x64\x20\x70\x68\x6f\x74\x6f\x20\x73\x6f\x75\x72\x63\x65\x20\x74\x79\x70\x65\x2e'));
      }
    });
  }
  async multiPassCompress(img) {
    let curWidth = img.naturalWidth || img.width;
    let curHeight = img.naturalHeight || img.height;
    if (curWidth > this.config.maxWidth || curHeight > this.config.maxHeight) {
      const ratio = Math.min(this.config.maxWidth / curWidth, this.config.maxHeight / curHeight);
      curWidth = Math.round(curWidth * ratio);
      curHeight = Math.round(curHeight * ratio);
    }
    const canvas = document.createElement('\x63\x61\x6e\x76\x61\x73');
    canvas.width = curWidth;
    canvas.height = curHeight;
    const ctx = canvas.getContext('\x32\x64');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = '\x68\x69\x67\x68';
    ctx.drawImage(img, 0, 0, curWidth, curHeight);
    let quality = this.config.initialQuality;
    let mimeType = this.config.preferredFormat;
    let dataUrl = canvas.toDataURL(mimeType, quality);
    if (!dataUrl.startsWith(`data:${this.config.preferredFormat}`)) {
      mimeType = this.config.fallbackFormat;
      dataUrl = canvas.toDataURL(mimeType, quality);
    }
    let estimatedBytes = Optimization.calcBase64Bytes(dataUrl);
    const maxTargetBytes = this.config.targetMaxKB * 1024;
    let pass = 0;
    while (estimatedBytes > maxTargetBytes && quality > this.config.minQuality && pass < 3) {
      pass++;
      quality = Math.max(this.config.minQuality, quality - 0.10);
      curWidth = Math.round(curWidth * 0.88);
      curHeight = Math.round(curHeight * 0.88);
      canvas.width = curWidth;
      canvas.height = curHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = '\x68\x69\x67\x68';
      ctx.drawImage(img, 0, 0, curWidth, curHeight);
      dataUrl = canvas.toDataURL(mimeType, quality);
      estimatedBytes = Optimization.calcBase64Bytes(dataUrl);
    }
    return { dataUrl, width: curWidth, height: curHeight, mimeType };
  }
  static calcBase64Bytes(dataUrl) {
    if (!dataUrl || typeof dataUrl !== '\x73\x74\x72\x69\x6e\x67') return 0;
    const commaIdx = dataUrl.indexOf('\x2c');
    const strLen = commaIdx > -1 ? dataUrl.length - (commaIdx + 1) : dataUrl.length;
    return Math.round(strLen * 0.75);
  }
  static formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '\x30\x20\x42';
    if (bytes < 1024) return bytes + '\x20\x42';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + '\x20\x4b\x42';
    return (bytes / (1024 * 1024)).toFixed(1) + '\x20\x4d\x42';
  }
}
if (typeof window !== '\x75\x6e\x64\x65\x66\x69\x6e\x65\x64') {
  window.Optimization = Optimization;
  window.ImageOptimizer = Optimization;
}
if (typeof module !== '\x75\x6e\x64\x65\x66\x69\x6e\x65\x64' && module.exports) {
  module.exports = Optimization;
}