/* ============================================
   汽车租赁 - 主应用逻辑
   ============================================ */

/** 当前查看的车辆ID（详情页用） */
let currentDetailId = null;
let swiperTimer = null;
let swiperIndex = 0;

/** 裁剪相关状态 */
let cropState = {
  file: null,          // 原始 File
  imageUrl: '',        // 原始图片 dataURL
  imgNatural: null,    // {w, h}
  box: { x: 0, y: 0, w: 0, h: 0 },
  isDragging: false,
  isResizing: false,
  resizeDir: '',
  dragStart: { x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 }
};

/** 当前编辑车辆暂存的图片数组（base64） */
let pendingImages = [];
/** 横幅暂存数组 */
let pendingBanners = [];
/** 裁剪目标：'car' | 'banner' */
let cropTarget = 'car';

/** ========== 页面初始化 ========== */
function initApp() {
  renderHome();
  renderCarList();
  loadCompanyToAdmin();
  renderAdminCarList();
  initQRCode();
}

/** ========== Tab 切换 ========== */
function switchTab(index) {
  const pages = ['page-home', 'page-cars', 'page-admin', 'page-qr'];
  const tabs = document.querySelectorAll('.tabbar-item');

  pages.forEach((id, i) => {
    document.getElementById(id).style.display = i === index ? 'block' : 'none';
  });
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });

  if (index === 1) renderCarList();
  if (index === 2) {
    loadCompanyToAdmin();
    renderAdminCarList();
  }
  if (index === 3) initQRCode();
}

/** ========== Toast 提示 ========== */
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2000);
}

/** ========== 首页渲染 ========== */
function renderHome() {
  const company = Store.getCompany();
  document.getElementById('home-company-name').textContent = company.name;
  document.getElementById('home-company-slogan').textContent = company.slogan;
  document.getElementById('about-text').textContent = company.description;
  document.getElementById('contact-phone').textContent = company.phone;
  document.getElementById('contact-phone').href = 'tel:' + company.phone;
  document.getElementById('contact-address').textContent = company.address;

  renderSwiper(company.banners);
  renderHomeCarList();
}

/** 轮播 */
function renderSwiper(banners) {
  const wrapper = document.getElementById('swiper-wrapper');
  const dots = document.getElementById('swiper-dots');
  const colors = ['#1a7be8', '#2563eb', '#0f5db8', '#1d4ed8', '#3b82f6'];

  const defaultBanners = banners && banners.length > 0
    ? banners.filter(b => b.trim())
    : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=400&fit=crop'];

  const displayBanners = defaultBanners.slice(0, 5);

  wrapper.innerHTML = displayBanners.map((url, i) => `
    <div class="swiper-slide" style="background:${colors[i % colors.length]}">
      <img src="${url}" alt="banner ${i+1}" onerror="this.parentElement.innerHTML='<div class=\\'slide-placeholder\\'><span class=\\'slide-icon\\'>🚗</span><span>轮播图 ${i+1}</span></div>'">
    </div>
  `).join('');

  dots.innerHTML = displayBanners.map((_, i) =>
    `<span class="swiper-dot ${i === 0 ? 'active' : ''}"></span>`
  ).join('');

  swiperIndex = 0;
  startSwiper(displayBanners.length);
}

function startSwiper(count) {
  clearInterval(swiperTimer);
  if (count <= 1) return;
  swiperTimer = setInterval(() => {
    swiperIndex = (swiperIndex + 1) % count;
    const wrapper = document.getElementById('swiper-wrapper');
    wrapper.style.transform = `translateX(-${swiperIndex * 100}%)`;
    const dots = document.querySelectorAll('.swiper-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === swiperIndex));
  }, 3000);
}

/** 首页 - 热门车型 */
function renderHomeCarList() {
  const cars = Store.getCars();
  const list = document.getElementById('home-car-list');
  const show = cars.slice(0, 4);

  list.innerHTML = show.length === 0
    ? '<div class="empty-state"><div class="empty-icon">🚗</div><p>暂无车型数据，请前往后台添加</p></div>'
    : show.map(car => buildCarCard(car)).join('');
}

/** 车型卡片 HTML */
function buildCarCard(car) {
  const img = Store.getCarImage(car);
  return `
    <div class="car-card" onclick="openDetail(${car.id})">
      <div class="car-card-img">
        ${img
          ? `<img src="${img}" alt="${car.name}" onerror="this.outerHTML='<span>🚗</span>'">`
          : '<span>🚗</span>'}
      </div>
      <div class="car-card-body">
        <div>
          <div class="car-card-name">${car.name}</div>
          <div class="car-card-tags">
            <span class="car-tag">${car.brand}</span>
            <span class="car-tag">${car.type}</span>
            <span class="car-tag">${car.seats}座</span>
          </div>
        </div>
        <div class="car-card-bottom">
          <div class="car-card-price">¥${car.price} <span>/ 天</span></div>
          <span class="car-card-more">详情 ›</span>
        </div>
      </div>
    </div>
  `;
}

/** ========== 全部车型 ========== */
function renderCarList() {
  const cars = Store.getCars();
  const brandFilter = document.getElementById('filter-brand').value;
  const typeFilter = document.getElementById('filter-type').value;
  const priceFilter = document.getElementById('filter-price').value;

  const brands = [...new Set(cars.map(c => c.brand))];
  const brandSelect = document.getElementById('filter-brand');
  brandSelect.innerHTML = '<option value="">全部品牌</option>' +
    brands.map(b => `<option value="${b}" ${b === brandFilter ? 'selected' : ''}>${b}</option>`).join('');

  const types = [...new Set(cars.map(c => c.type))];
  const typeSelect = document.getElementById('filter-type');
  typeSelect.innerHTML = '<option value="">全部类型</option>' +
    types.map(t => `<option value="${t}" ${t === typeFilter ? 'selected' : ''}>${t}</option>`).join('');

  let filtered = cars;
  if (brandFilter) filtered = filtered.filter(c => c.brand === brandFilter);
  if (typeFilter) filtered = filtered.filter(c => c.type === typeFilter);
  if (priceFilter) {
    const [min, max] = priceFilter.split('-').map(Number);
    filtered = filtered.filter(c => c.price >= min && c.price <= max);
  }

  const list = document.getElementById('full-car-list');
  list.innerHTML = filtered.length === 0
    ? '<div class="empty-state"><div class="empty-icon">🔍</div><p>没有符合条件的车型</p></div>'
    : filtered.map(car => buildCarCard(car)).join('');
}

/** ========== 车辆详情 ========== */
function openDetail(id) {
  currentDetailId = id;
  const car = Store.getCar(id);
  if (!car) { showToast('车辆信息不存在'); return; }

  const company = Store.getCompany();
  const images = (car.images && car.images.length > 0) ? car.images : (car.image ? [car.image] : []);

  let bannerHtml = '';
  if (images.length === 0) {
    bannerHtml = '<div class="detail-banner-slide"><span style="font-size:60px">🚗</span></div>';
  } else if (images.length === 1) {
    bannerHtml = `<div class="detail-banner-slide"><img src="${images[0]}" alt="车辆图" onerror="this.outerHTML='<span style=\\'font-size:60px\\'>🚗</span>'"></div>`;
  } else {
    bannerHtml = `
      <div class="detail-banner-wrapper">
        <div class="detail-banner-track" id="detail-banner-track">
          ${images.map(url => `
            <div class="detail-banner-slide">
              <img src="${url}" alt="车辆图" onerror="this.outerHTML='<span style=\\'font-size:60px\\'>🚗</span>'">
            </div>
          `).join('')}
        </div>
        <div class="detail-banner-dots" id="detail-banner-dots">
          ${images.map((_, i) => `<span class="dot ${i===0?'active':''}"></span>`).join('')}
        </div>
        <div class="detail-banner-count">1/${images.length}</div>
      </div>
    `;
  }

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-banner-area">${bannerHtml}</div>
    <div class="detail-info">
      <div class="detail-info-top">
        <div>
          <div class="detail-info-name">${car.name}</div>
          <div class="car-card-tags" style="margin-top:6px">
            <span class="car-tag">${car.brand}</span>
            <span class="car-tag">${car.type}</span>
          </div>
        </div>
        <div class="detail-info-price">¥${car.price}<span>/天</span></div>
      </div>
      <div class="detail-specs">
        <div class="detail-spec">
          <div class="detail-spec-label">座位</div>
          <div class="detail-spec-value">${car.seats}座</div>
        </div>
        <div class="detail-spec">
          <div class="detail-spec-label">品牌</div>
          <div class="detail-spec-value">${car.brand}</div>
        </div>
        <div class="detail-spec">
          <div class="detail-spec-label">类型</div>
          <div class="detail-spec-value">${car.type}</div>
        </div>
      </div>
    </div>
    <div class="detail-section-block">
      <h3>车辆介绍</h3>
      <p>${car.description || '暂无介绍'}</p>
    </div>
    <div class="detail-section-block">
      <h3>租赁说明</h3>
      <p style="white-space:pre-line">${car.rental || '请联系客服咨询租赁详情。'}</p>
    </div>
  `;

  document.getElementById('detail-price').innerHTML = `¥${car.price} <span>/ 天</span>`;
  document.getElementById('detail-consult-link').href = 'tel:' + company.phone;

  // 多图轮播交互
  if (images.length > 1) {
    let detailSwiperIdx = 0;
    const track = document.getElementById('detail-banner-track');
    const dots = document.querySelectorAll('#detail-banner-dots .dot');
    const countEl = document.querySelector('.detail-banner-count');
    let detailTimer = setInterval(() => {
      detailSwiperIdx = (detailSwiperIdx + 1) % images.length;
      track.style.transform = `translateX(-${detailSwiperIdx * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === detailSwiperIdx));
      if (countEl) countEl.textContent = `${detailSwiperIdx + 1}/${images.length}`;
    }, 3000);
    // 清理旧定时器
    document.getElementById('page-detail')._swiperTimer = detailTimer;
  }

  // 切换页面
  const oldTimer = document.getElementById('page-detail')._swiperTimer;
  if (!images.length > 1 && oldTimer) clearInterval(oldTimer);

  document.getElementById('page-home').style.display = 'none';
  document.getElementById('page-cars').style.display = 'none';
  document.getElementById('page-admin').style.display = 'none';
  document.getElementById('page-qr').style.display = 'none';
  document.getElementById('page-detail').style.display = 'block';
  document.getElementById('tabbar').style.display = 'none';
}

function goBackFromDetail() {
  // 清理详情页轮播
  const timer = document.getElementById('page-detail')._swiperTimer;
  if (timer) clearInterval(timer);
  document.getElementById('page-detail').style.display = 'none';
  document.getElementById('tabbar').style.display = 'flex';
  switchTab(0);
}

/** ========== 管理后台 ========== */

/** 加载公司信息到表单 */
function loadCompanyToAdmin() {
  const company = Store.getCompany();
  document.getElementById('edit-company-name').value = company.name || '';
  document.getElementById('edit-company-slogan').value = company.slogan || '';
  document.getElementById('edit-company-phone').value = company.phone || '';
  document.getElementById('edit-company-address').value = company.address || '';
  document.getElementById('edit-company-desc').value = company.description || '';
  // 加载已有轮播图到 pendingBanners
  pendingBanners = (company.banners || []).filter(Boolean);
  renderBannerPreview();
}

/** 保存公司信息 */
function saveCompanyInfo() {
  const data = {
    name: document.getElementById('edit-company-name').value.trim(),
    slogan: document.getElementById('edit-company-slogan').value.trim(),
    phone: document.getElementById('edit-company-phone').value.trim(),
    address: document.getElementById('edit-company-address').value.trim(),
    description: document.getElementById('edit-company-desc').value.trim(),
    banners: pendingBanners.length > 0 ? [...pendingBanners] : []
  };

  if (!data.name) { showToast('请输入公司名称'); return; }
  if (!data.phone) { showToast('请输入联系电话'); return; }

  Store.setCompany(data);
  renderHome();
  pendingBanners = [...data.banners]; // 保持预览显示已保存状态
  renderBannerPreview();
  showToast('公司信息已保存 ✅');
}

/** 切换后台 tab */
function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`.admin-tab[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`admin-${tab}`).classList.add('active');
}

/** 渲染后台车辆列表 */
function renderAdminCarList() {
  const cars = Store.getCars();
  const el = document.getElementById('admin-car-items');

  el.innerHTML = cars.length === 0
    ? '<div class="empty-state"><div class="empty-icon">🚗</div><p>还没有添加车辆，请在左侧添加</p></div>'
    : cars.map(car => {
        const img = Store.getCarImage(car);
        const imgCount = (car.images && car.images.length) || (car.image ? 1 : 0);
        return `
          <div class="admin-car-item">
            <div class="admin-car-item-img">
              ${img
                ? `<img src="${img}" alt="${car.name}" onerror="this.outerHTML='🚗'">`
                : '🚗'}
            </div>
            <div class="admin-car-item-info">
              <div class="admin-car-item-name">${car.name} ${imgCount > 1 ? `<span style="font-size:11px;color:var(--text-light)">(${imgCount}张)</span>` : ''}</div>
              <div class="admin-car-item-desc">${car.brand} · ${car.type} · ¥${car.price}/天</div>
            </div>
            <div class="admin-car-item-actions">
              <button class="btn btn-small btn-secondary" onclick="editCar(${car.id})">✏️</button>
              <button class="btn btn-small btn-danger" onclick="deleteCar(${car.id})">🗑️</button>
            </div>
          </div>
        `;
      }).join('');
}

/** 重置车辆表单 */
function resetCarForm() {
  document.getElementById('edit-car-id').value = '';
  document.getElementById('edit-car-name').value = '';
  document.getElementById('edit-car-brand').value = '';
  document.getElementById('edit-car-type').value = '经济型';
  document.getElementById('edit-car-seats').value = '5';
  document.getElementById('edit-car-price').value = '';
  document.getElementById('edit-car-desc').value = '';
  document.getElementById('edit-car-rental').value = '';
  document.getElementById('car-form-title').textContent = '添加车辆';
  pendingImages = [];
  renderImagePreview();
}

/** 编辑车辆 */
function editCar(id) {
  const car = Store.getCar(id);
  if (!car) { showToast('车辆不存在'); return; }

  document.getElementById('edit-car-id').value = car.id;
  document.getElementById('edit-car-name').value = car.name || '';
  document.getElementById('edit-car-brand').value = car.brand || '';
  document.getElementById('edit-car-type').value = car.type || '经济型';
  document.getElementById('edit-car-seats').value = car.seats || 5;
  document.getElementById('edit-car-price').value = car.price || '';
  document.getElementById('edit-car-desc').value = car.description || '';
  document.getElementById('edit-car-rental').value = car.rental || '';
  document.getElementById('car-form-title').textContent = '编辑车辆';

  // 加载已有图片到 pendingImages
  pendingImages = [];
  if (car.images && car.images.length > 0) {
    pendingImages = [...car.images];
  } else if (car.image) {
    pendingImages = [car.image];
  }
  renderImagePreview();

  // 切换到车辆 tab
  switchAdminTab('cars');
  document.querySelector('.car-form').scrollIntoView({ behavior: 'smooth' });
}

/** ========== 图片上传与裁剪 ========== */

/** 选择文件后处理 */
function handleFileSelect(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  // 逐张打开裁剪
  Array.from(files).forEach(f => {
    if (!f.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      openCrop(e.target.result, f);
    };
    reader.readAsDataURL(f);
  });

  // 清空 input 以便重复选择同一文件
  event.target.value = '';
}

/** 打开裁剪弹窗 */
function openCrop(dataUrl, file, target = 'car') {
  cropTarget = target;
  const modal = document.getElementById('crop-modal');
  modal.style.display = 'flex';

  const img = document.getElementById('crop-image');
  img.src = dataUrl;

  cropState.file = file;
  cropState.imageUrl = dataUrl;

  img.onload = () => {
    cropState.imgNatural = { w: img.naturalWidth, h: img.naturalHeight };

    // 计算容器尺寸
    const container = document.getElementById('crop-container');
    const maxW = container.clientWidth || 380;
    const maxH = container.clientHeight || 350;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    const displayW = img.naturalWidth * scale;
    const displayH = img.naturalHeight * scale;

    // 裁剪框初始为居中，4:3 横版比例
    let boxW = displayW * 0.8;
    let boxH = boxW * (3 / 4); // 宽:高 = 4:3 = 横版
    if (boxH > displayH * 0.8) {
      boxH = displayH * 0.8;
      boxW = boxH * (4 / 3); // 重新计算宽度保持横版
    }
    const boxX = (displayW - boxW) / 2;
    const boxY = (displayH - boxH) / 2;

    cropState.box = { x: boxX, y: boxY, w: boxW, h: boxH };
    updateCropBox();
  };
}

/** 更新裁剪框位置 */
function updateCropBox() {
  const box = document.getElementById('crop-box');
  box.style.left = cropState.box.x + 'px';
  box.style.top = cropState.box.y + 'px';
  box.style.width = cropState.box.w + 'px';
  box.style.height = cropState.box.h + 'px';
}

/** 关闭裁剪 */
function closeCrop() {
  document.getElementById('crop-modal').style.display = 'none';
  cropState.file = null;
  cropState.imageUrl = '';
}

/** 确认裁剪 */
function confirmCrop() {
  const img = document.getElementById('crop-image');
  const container = document.getElementById('crop-container');
  const scaleX = cropState.imgNatural.w / (container.clientWidth || img.naturalWidth);
  const scaleY = cropState.imgNatural.h / (container.clientHeight || img.naturalHeight);

  // 实际显示比例（图片在容器中的缩放）
  const dispW = container.querySelector('img').offsetWidth || 300;
  const dispH = container.querySelector('img').offsetHeight || 300;
  const sX = cropState.imgNatural.w / dispW;
  const sY = cropState.imgNatural.h / dispH;

  // 计算裁剪坐标（原始图片像素）
  const cropX = Math.round(cropState.box.x * sX);
  const cropY = Math.round(cropState.box.y * sY);
  const cropW = Math.round(cropState.box.w * sX);
  const cropH = Math.round(cropState.box.h * sY);

  // 用 Canvas 执行裁剪
  const canvas = document.createElement('canvas');
  const outW = 1200; // 输出宽度
  const outH = 900; // 输出高度（4:3 横版）
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

  // 根据目标添加到对应列表
  if (cropTarget === 'banner') {
    pendingBanners.push(dataUrl);
    renderBannerPreview();
  } else {
    pendingImages.push(dataUrl);
    renderImagePreview();
  }
  closeCrop();
}

/** 渲染图片预览 */
function renderImagePreview() {
  const el = document.getElementById('image-preview-list');
  if (pendingImages.length === 0) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = pendingImages.map((url, i) => `
    <div class="image-preview-item">
      <span class="img-index">${i + 1}</span>
      <button class="img-del" onclick="removeImage(${i})">✕</button>
      <img src="${url}" alt="车辆图 ${i+1}">
    </div>
  `).join('');
}

/** 删除某张图片 */
function removeImage(index) {
  pendingImages.splice(index, 1);
  renderImagePreview();
}

/** 选择横幅图片 */
function handleBannerSelect(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  Array.from(files).forEach(f => {
    if (!f.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      openCrop(e.target.result, f, 'banner');
    };
    reader.readAsDataURL(f);
  });
  event.target.value = '';
}

/** 渲染横幅预览 */
function renderBannerPreview() {
  const el = document.getElementById('banner-preview-list');
  if (pendingBanners.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = pendingBanners.map((url, i) => `
    <div class="image-preview-item">
      <span class="img-index">${i + 1}</span>
      <button class="img-del" onclick="removeBanner(${i})">✕</button>
      <img src="${url}" alt="横幅图 ${i+1}">
    </div>
  `).join('');
}

/** 删除某张横幅 */
function removeBanner(index) {
  pendingBanners.splice(index, 1);
  renderBannerPreview();
}

/** ========== 裁剪框拖拽交互 ========== */

// 鼠标/触摸事件绑定到 crop-container
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('crop-container');

  // 鼠标按下
  container.addEventListener('mousedown', (e) => {
    const box = document.getElementById('crop-box');
    const target = e.target;

    if (target.classList.contains('crop-handle')) {
      // 拖拽手柄（缩放）
      cropState.isResizing = true;
      cropState.resizeDir = Array.from(target.classList)
        .find(c => c.startsWith('crop-handle-'))
        .replace('crop-handle-', '');
      cropState.dragStart = {
        x: e.clientX,
        y: e.clientY,
        boxX: cropState.box.x,
        boxY: cropState.box.y,
        boxW: cropState.box.w,
        boxH: cropState.box.h
      };
      e.preventDefault();
    } else if (target === box || box.contains(target)) {
      // 拖拽移动
      cropState.isDragging = true;
      cropState.dragStart = {
        x: e.clientX,
        y: e.clientY,
        boxX: cropState.box.x,
        boxY: cropState.box.y
      };
      e.preventDefault();
    }
  });

  // 鼠标移动
  container.addEventListener('mousemove', (e) => {
    if (!cropState.isDragging && !cropState.isResizing) return;

    const dx = e.clientX - cropState.dragStart.x;
    const dy = e.clientY - cropState.dragStart.y;
    const containerEl = document.getElementById('crop-container');
    const imgEl = containerEl.querySelector('img');
    const maxW = imgEl.offsetWidth;
    const maxH = imgEl.offsetHeight;

    if (cropState.isDragging) {
      let nx = cropState.dragStart.boxX + dx;
      let ny = cropState.dragStart.boxY + dy;
      // 边界限制
      nx = Math.max(0, Math.min(nx, maxW - cropState.box.w));
      ny = Math.max(0, Math.min(ny, maxH - cropState.box.h));
      cropState.box.x = nx;
      cropState.box.y = ny;
      updateCropBox();
    } else if (cropState.isResizing) {
      const dir = cropState.resizeDir;
      let b = { ...cropState.dragStart };
      let boxW = b.boxW;
      let boxH = b.boxH;
      let boxX = b.boxX;
      let boxY = b.boxY;

      if (dir.includes('e')) {
        boxW = Math.max(60, b.boxW + dx);
        boxH = boxW * (3 / 4); // 锁定 4:3 横版
      } else if (dir.includes('w')) {
        boxW = Math.max(60, b.boxW - dx);
        boxH = boxW * (3 / 4);
        boxX = b.boxX + (b.boxW - boxW);
      }

      if (dir.includes('s')) {
        // 高度由宽度锁定
      } else if (dir.includes('n')) {
        boxY = b.boxY + (b.boxH - boxH);
      }

      // 边界检查
      if (boxX < 0) { boxX = 0; boxW = b.boxW; boxH = b.boxH; }
      if (boxY < 0) { boxY = 0; boxH = b.boxH; boxW = b.boxW; }
      if (boxX + boxW > maxW) { boxX = maxW - boxW; }
      if (boxY + boxH > maxH) { boxY = maxH - boxH; }

      cropState.box = { x: boxX, y: boxY, w: boxW, h: boxH };
      updateCropBox();
    }
  });

  // 鼠标释放
  document.addEventListener('mouseup', () => {
    cropState.isDragging = false;
    cropState.isResizing = false;
  });

  // 触摸支持
  container.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const me = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    container.dispatchEvent(me);
    e.preventDefault();
  }, { passive: false });

  container.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const me = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    container.dispatchEvent(me);
    e.preventDefault();
  }, { passive: false });

  container.addEventListener('touchend', (e) => {
    const me = new MouseEvent('mouseup', {});
    document.dispatchEvent(me);
  });
});

/** ========== 保存 & 删除车辆 ========== */

/** 保存车辆（新建或更新） */
function saveCar() {
  const id = document.getElementById('edit-car-id').value;
  const data = {
    name: document.getElementById('edit-car-name').value.trim(),
    brand: document.getElementById('edit-car-brand').value.trim(),
    type: document.getElementById('edit-car-type').value,
    seats: parseInt(document.getElementById('edit-car-seats').value) || 5,
    price: parseInt(document.getElementById('edit-car-price').value) || 0,
    images: pendingImages.length > 0 ? [...pendingImages] : [],
    description: document.getElementById('edit-car-desc').value.trim(),
    rental: document.getElementById('edit-car-rental').value.trim()
  };

  // 清除旧版单图字段
  delete data.image;

  if (!data.name) { showToast('请输入车辆名称'); return; }
  if (!data.brand) { showToast('请输入品牌'); return; }
  if (!data.price || data.price <= 0) { showToast('请输入有效的价格'); return; }

  if (id) {
    Store.updateCar(parseInt(id), data);
    showToast('车辆已更新 ✅');
  } else {
    Store.addCar(data);
    showToast('车辆已添加 ✅');
  }

  resetCarForm();
  renderAdminCarList();
  renderCarList();
  renderHomeCarList();
}

/** 删除车辆 */
function deleteCar(id) {
  if (!confirm('确定要删除该车辆吗？')) return;
  Store.deleteCar(id);
  renderAdminCarList();
  renderCarList();
  renderHomeCarList();
  showToast('车辆已删除');
}

/** ========== 二维码 ========== */
let qrInstance = null;

function initQRCode() {
  const company = Store.getCompany();
  document.getElementById('qr-company-name').textContent = company.name;

  const container = document.getElementById('qrcode');
  container.innerHTML = '';

  const url = window.location.href.split('?')[0];

  try {
    qrInstance = new QRCode(container, {
      text: url,
      width: 180,
      height: 180,
      colorDark: '#1e293b',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch(e) {
    container.innerHTML = '<canvas id="qr-canvas"></canvas>';
    try {
      qrInstance = new QRCode(document.getElementById('qr-canvas'), {
        text: url,
        width: 180,
        height: 180,
        colorDark: '#1e293b',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } catch(e2) {
      container.innerHTML = `<div style="padding:20px;color:var(--text-light)">⚠️ 二维码加载失败，请检查网络连接</div>`;
    }
  }
}

/** 下载二维码 */
function downloadQR() {
  const canvas = document.querySelector('#qrcode canvas') || document.querySelector('#qrcode img');
  if (!canvas) { showToast('二维码尚未生成'); return; }

  let imgSrc;
  if (canvas.tagName === 'CANVAS') {
    imgSrc = canvas.toDataURL('image/png');
  } else if (canvas.tagName === 'IMG') {
    const c = document.createElement('canvas');
    c.width = 180;
    c.height = 180;
    const ctx = c.getContext('2d');
    ctx.drawImage(canvas, 0, 0, 180, 180);
    imgSrc = c.toDataURL('image/png');
  }

  if (!imgSrc) { showToast('生成失败，请重试'); return; }

  const link = document.createElement('a');
  link.download = '租车二维码.png';
  link.href = imgSrc;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('二维码已保存 📱');
}

/** ========== 启动 ========== */
document.addEventListener('DOMContentLoaded', initApp);
