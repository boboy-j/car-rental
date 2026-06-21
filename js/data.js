/* ============================================
   汽车租赁 - 数据层
   ============================================ */

/** 默认公司信息 */
const DEFAULT_COMPANY = {
  name: '鼎盛汽车租赁',
  slogan: '品质服务 · 安心出行',
  phone: '13800000000',
  address: 'XX市XX区XX路XX号',
  description: '专业汽车租赁服务商，提供高品质、高性价比的汽车租赁方案。我们拥有丰富的车型选择，完善的售后保障，让您的每一次出行都安心无忧。',
  banners: [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=400&fit=crop',
  ]
};

/** 默认车型数据（images 改为数组，第一张为首图） */
const DEFAULT_CARS = [
  {
    id: 1,
    name: '宝马5系',
    brand: '宝马',
    type: '豪华型',
    seats: 5,
    price: 600,
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=533&fit=crop'],
    description: '2023款宝马5系，2.0T涡轮增压发动机，8速手自一体变速箱，真皮座椅，全景天窗，驾驶体验卓越。',
    rental: '• 日租价格：600元/天\n• 押金：5000元\n• 需提供身份证+驾驶证\n• 超时按小时计费\n• 满油取车，满油还车'
  },
  {
    id: 2,
    name: '奔驰GLC',
    brand: '奔驰',
    type: 'SUV',
    seats: 5,
    price: 750,
    images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=533&fit=crop'],
    description: '2023款奔驰GLC300，2.0T发动机，9速自动变速箱，四驱系统，豪华内饰，全景影像。',
    rental: '• 日租价格：750元/天\n• 押金：6000元\n• 需提供身份证+驾驶证\n• 超时按小时计费'
  },
  {
    id: 3,
    name: '奥迪A6L',
    brand: '奥迪',
    type: '豪华型',
    seats: 5,
    price: 550,
    images: ['https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=533&fit=crop'],
    description: '2023款奥迪A6L，2.0T高功率发动机，7速双离合，矩阵式LED大灯，虚拟座舱，舒适悬架。',
    rental: '• 日租价格：550元/天\n• 押金：5000元\n• 需提供身份证+驾驶证'
  },
  {
    id: 4,
    name: '丰田凯美瑞',
    brand: '丰田',
    type: '舒适型',
    seats: 5,
    price: 280,
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=533&fit=crop'],
    description: '2023款丰田凯美瑞，2.0L自然吸气发动机，CVT变速箱，油耗低，空间宽敞，适合家庭出行。',
    rental: '• 日租价格：280元/天\n• 押金：3000元\n• 需提供身份证+驾驶证'
  },
  {
    id: 5,
    name: '特斯拉Model Y',
    brand: '特斯拉',
    type: '新能源',
    seats: 5,
    price: 500,
    images: ['https://images.unsplash.com/photo-1619767886558-efdc7b9af1f6?w=400&h=533&fit=crop'],
    description: '特斯拉Model Y纯电SUV，续航545公里，AP辅助驾驶，超大空间，科技感十足。',
    rental: '• 日租价格：500元/天\n• 押金：8000元\n• 需提供身份证+驾驶证\n• 满电取车，满电还车'
  },
  {
    id: 6,
    name: '别克GL8',
    brand: '别克',
    type: '商务车',
    seats: 7,
    price: 450,
    images: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=533&fit=crop'],
    description: '别克GL8陆尊，2.0T发动机，7座布局，航空座椅，电动侧滑门，商务接待首选。',
    rental: '• 日租价格：450元/天\n• 押金：4000元\n• 需提供身份证+驾驶证'
  },
  {
    id: 7,
    name: '保时捷718',
    brand: '保时捷',
    type: '跑车',
    seats: 2,
    price: 1500,
    images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=400&h=533&fit=crop'],
    description: '保时捷718 Boxster，2.0T水平对置发动机，0-100km/h加速5.6秒，敞篷设计，极致驾驶乐趣。',
    rental: '• 日租价格：1500元/天\n• 押金：20000元\n• 需提供身份证+驾驶证\n• 需驾龄2年以上'
  },
  {
    id: 8,
    name: '本田CR-V',
    brand: '本田',
    type: 'SUV',
    seats: 5,
    price: 260,
    images: ['https://images.unsplash.com/photo-1568844293986-ca777cb4c0d2?w=400&h=533&fit=crop'],
    description: '本田CR-V，1.5T涡轮增压发动机，空间利用率高，油耗经济，家用SUV口碑之选。',
    rental: '• 日租价格：260元/天\n• 押金：3000元\n• 需提供身份证+驾驶证'
  }
];

/** 数据管理 */
const Store = {
  /** 获取公司信息 */
  getCompany() {
    try {
      const data = localStorage.getItem('car_rental_company');
      return data ? JSON.parse(data) : { ...DEFAULT_COMPANY };
    } catch { return { ...DEFAULT_COMPANY }; }
  },

  /** 保存公司信息 */
  setCompany(data) {
    localStorage.setItem('car_rental_company', JSON.stringify(data));
  },

  /** 获取所有车辆 */
  getCars() {
    try {
      const data = localStorage.getItem('car_rental_cars');
      return data ? JSON.parse(data) : DEFAULT_CARS.map(c => ({ ...c }));
    } catch { return DEFAULT_CARS.map(c => ({ ...c })); }
  },

  /** 保存车辆列表 */
  setCars(cars) {
    localStorage.setItem('car_rental_cars', JSON.stringify(cars));
  },

  /** 获取车辆首图（兼容旧版单图字段 image） */
  getCarImage(car) {
    if (car.images && car.images.length > 0) return car.images[0];
    if (car.image) return car.image;
    return '';
  },

  /** 获取单辆车 */
  getCar(id) {
    return this.getCars().find(c => c.id === id) || null;
  },

  /** 添加车辆 */
  addCar(car) {
    const cars = this.getCars();
    car.id = Date.now(); // 简单生成唯一ID
    cars.push(car);
    this.setCars(cars);
    return car;
  },

  /** 更新车辆 */
  updateCar(id, data) {
    const cars = this.getCars();
    const idx = cars.findIndex(c => c.id === id);
    if (idx === -1) return false;
    cars[idx] = { ...cars[idx], ...data };
    this.setCars(cars);
    return true;
  },

  /** 删除车辆 */
  deleteCar(id) {
    let cars = this.getCars();
    cars = cars.filter(c => c.id !== id);
    this.setCars(cars);
  }
};
