import mongoose from 'mongoose';

/**
 * In-memory storage when running without external MongoDB instance
 */
export const db = {
  users: [
    {
      _id: 'admin0000000000000000001',
      name: 'مدیر کل فروشگاه برنج',
      phone: '09120000000',
      password: '$2b$10$FcHvGNXcSdo4n7MtZ3059e5xXIS.GBdDuMK.2bgSYI2igMefTvrga', // adminpassword
      role: 'admin',
      address: 'تهران، دفتر مرکزی فروشگاه برنج',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  products: [
    {
      _id: 'prod00000000000000000001',
      name: 'برنج طارم هاشمی درجه یک مازندران',
      description: 'برنج طارم هاشمی معطر، الک شده و بدون شکستگی، دستچین مزارع فریدونکنار',
      price: 210000,
      originalPrice: 240000,
      discountPercent: 12,
      isAmazing: true,
      isAvailable: true,
      countInStock: 85,
      image: '/uploads/products/hashemi.jpg',
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'prod00000000000000000002',
      name: 'نیم دانه برنج طارم هاشمی معطر',
      description: 'نیم دانه برنج طارم درجه یک، مناسب برای سوپ، شله زرد و مصرف روزانه خانواده',
      price: 130000,
      originalPrice: 150000,
      discountPercent: 13,
      isAmazing: false,
      isAvailable: true,
      countInStock: 120,
      image: '/uploads/products/nim-dane.jpg',
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'prod00000000000000000003',
      name: 'ریز دانه برنج اعلا (سرلاشخور)',
      description: 'ریز دانه برنج تمیز شده و سورت شده، کیفیت عالی برای آرد برنج و شیربرنج',
      price: 95000,
      originalPrice: 110000,
      discountPercent: 14,
      isAmazing: true,
      isAvailable: true,
      countInStock: 200,
      image: '/uploads/products/riz-dane.jpg',
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  carts: [],
  orders: [],
  reviews: [],
  slides: [
    {
      _id: 'slide0000000000000000001',
      image: '/uploads/slides/banner-rice-harvest.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  generateId: () => new mongoose.Types.ObjectId().toString()
};


// Map model names to db property names
const getCollectionKey = (modelName) => {
  const name = (modelName || '').toLowerCase();
  if (name.includes('user')) return 'users';
  if (name.includes('product')) return 'products';
  if (name.includes('cart')) return 'carts';
  if (name.includes('order')) return 'orders';
  if (name.includes('review')) return 'reviews';
  if (name.includes('slide')) return 'slides';
  return `${name}s`;
};

// Filter match helper
const matchesFilter = (item, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, val] of Object.entries(filter)) {
    // Ignore meta/sort keys
    if (key === 'sortBy' || key === 'page' || key === 'limit') continue;

    // Search query match
    if (key === 'search' || key === 'q') {
      const q = String(val).toLowerCase().trim();
      const matchName = String(item.name || '').toLowerCase().includes(q);
      const matchDesc = String(item.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
      continue;
    }

    if (key === 'minPrice' && val !== undefined) {
      if (Number(item.price) < Number(val)) return false;
      continue;
    }
    if (key === 'maxPrice' && val !== undefined) {
      if (Number(item.price) > Number(val)) return false;
      continue;
    }

    if (key === 'isAmazing' && val !== undefined) {
      const boolVal = val === true || val === 'true';
      if (Boolean(item.isAmazing) !== boolVal) return false;
      continue;
    }

    if (key === 'isAvailable' && val !== undefined) {
      const boolVal = val === true || val === 'true';
      if (Boolean(item.isAvailable) !== boolVal) return false;
      continue;
    }

    if (key === '$or' && Array.isArray(val)) {
      const orMatch = val.some(subFilter => matchesFilter(item, subFilter));
      if (!orMatch) return false;
      continue;
    }
    if (val && typeof val === 'object' && val.$regex) {
      const reg = new RegExp(val.$regex, val.$options || 'i');
      if (!reg.test(String(item[key] || ''))) return false;
      continue;
    }
    if (val && typeof val === 'object' && (val.$gte !== undefined || val.$lte !== undefined)) {
      const num = Number(item[key]);
      if (val.$gte !== undefined && num < Number(val.$gte)) return false;
      if (val.$lte !== undefined && num > Number(val.$lte)) return false;
      continue;
    }
    if (item[key] !== val && String(item[key]) !== String(val)) {
      return false;
    }
  }
  return true;
};


// Global Mongoose plugin for seamless In-Memory execution when disconnected
mongoose.plugin((schema) => {
  schema.pre('save', function(next) {
    if (mongoose.connection.readyState !== 1) {
      const coll = getCollectionKey(this.constructor.modelName);
      if (!db[coll]) db[coll] = [];
      const obj = this.toObject ? this.toObject() : { ...this };
      if (!obj._id) obj._id = db.generateId();
      const existingIdx = db[coll].findIndex(i => String(i._id) === String(obj._id));
      if (existingIdx > -1) {
        db[coll][existingIdx] = { ...db[coll][existingIdx], ...obj, updatedAt: new Date() };
      } else {
        db[coll].push({ ...obj, createdAt: new Date(), updatedAt: new Date() });
      }
    }
    next();
  });
});

// Patch Mongoose Model methods to handle in-memory queries when mongoose.connection.readyState !== 1
const originalModel = mongoose.model.bind(mongoose);
mongoose.model = function(name, schema, collection) {
  const Model = originalModel(name, schema, collection);
  const collKey = getCollectionKey(name);

  // Original methods
  const origFind = Model.find.bind(Model);
  const origFindOne = Model.findOne.bind(Model);
  const origFindById = Model.findById.bind(Model);
  const origCreate = Model.create.bind(Model);
  const origFindByIdAndUpdate = Model.findByIdAndUpdate.bind(Model);
  const origFindOneAndUpdate = Model.findOneAndUpdate.bind(Model);
  const origFindByIdAndDelete = Model.findByIdAndDelete.bind(Model);
  const origDeleteOne = Model.deleteOne.bind(Model);
  const origCount = Model.countDocuments.bind(Model);

  // In-memory query builder
  const createMemoryQuery = (action, filter, update, options) => {
    let sortFn = null;
    let limitNum = null;
    let skipNum = null;

    const execute = async () => {
      if (!db[collKey]) db[collKey] = [];
      const items = db[collKey];

      if (action === 'find') {
        let results = items.filter(item => matchesFilter(item, filter));
        if (sortFn) results.sort(sortFn);
        if (skipNum) results = results.slice(skipNum);
        if (limitNum) results = results.slice(0, limitNum);
        return results;
      }
      if (action === 'findOne') {
        return items.find(item => matchesFilter(item, filter)) || null;
      }
      if (action === 'findById') {
        const idStr = String(filter);
        return items.find(item => String(item._id) === idStr) || null;
      }
      if (action === 'count') {
        return items.filter(item => matchesFilter(item, filter)).length;
      }
      if (action === 'findByIdAndUpdate') {
        const idStr = String(filter);
        const idx = items.findIndex(item => String(item._id) === idStr);
        if (idx === -1) return null;
        items[idx] = { ...items[idx], ...update, updatedAt: new Date() };
        return items[idx];
      }
      if (action === 'findOneAndUpdate') {
        let idx = items.findIndex(item => matchesFilter(item, filter));
        if (idx === -1) {
          if (options && options.upsert) {
            const newItem = { _id: db.generateId(), ...filter, ...update, createdAt: new Date(), updatedAt: new Date() };
            items.push(newItem);
            return newItem;
          }
          return null;
        }
        items[idx] = { ...items[idx], ...update, updatedAt: new Date() };
        return items[idx];
      }
      if (action === 'findByIdAndDelete') {
        const idStr = String(filter);
        const idx = items.findIndex(item => String(item._id) === idStr);
        if (idx === -1) return null;
        return items.splice(idx, 1)[0];
      }
      if (action === 'deleteOne') {
        const idx = items.findIndex(item => matchesFilter(item, filter));
        if (idx === -1) return { deletedCount: 0 };
        items.splice(idx, 1);
        return { deletedCount: 1 };
      }
    };

    const queryObj = {
      lean: () => queryObj,
      sort: (sortArg) => {
        if (sortArg && typeof sortArg === 'object') {
          const field = Object.keys(sortArg)[0];
          const dir = sortArg[field];
          sortFn = (a, b) => (dir === -1 || dir === 'desc')
            ? (new Date(b[field] || 0) - new Date(a[field] || 0))
            : (new Date(a[field] || 0) - new Date(b[field] || 0));
        }
        return queryObj;
      },
      skip: (num) => { skipNum = num; return queryObj; },
      limit: (num) => { limitNum = num; return queryObj; },
      select: () => queryObj,
      populate: () => queryObj,
      then: (resolve, reject) => execute().then(resolve, reject),
      catch: (reject) => execute().catch(reject),
      exec: () => execute()
    };

    return queryObj;
  };

  Model.find = function(filter = {}) {
    if (mongoose.connection.readyState === 1) return origFind(filter);
    return createMemoryQuery('find', filter);
  };

  Model.findOne = function(filter = {}) {
    if (mongoose.connection.readyState === 1) return origFindOne(filter);
    return createMemoryQuery('findOne', filter);
  };

  Model.findById = function(id) {
    if (mongoose.connection.readyState === 1) return origFindById(id);
    return createMemoryQuery('findById', id);
  };

  Model.findByIdAndUpdate = function(id, update, options) {
    if (mongoose.connection.readyState === 1) return origFindByIdAndUpdate(id, update, options);
    return createMemoryQuery('findByIdAndUpdate', id, update, options);
  };

  Model.findOneAndUpdate = function(filter, update, options) {
    if (mongoose.connection.readyState === 1) return origFindOneAndUpdate(filter, update, options);
    return createMemoryQuery('findOneAndUpdate', filter, update, options);
  };

  Model.findByIdAndDelete = function(id) {
    if (mongoose.connection.readyState === 1) return origFindByIdAndDelete(id);
    return createMemoryQuery('findByIdAndDelete', id);
  };

  Model.deleteOne = function(filter) {
    if (mongoose.connection.readyState === 1) return origDeleteOne(filter);
    return createMemoryQuery('deleteOne', filter);
  };

  Model.countDocuments = function(filter = {}) {
    if (mongoose.connection.readyState === 1) return origCount(filter);
    return createMemoryQuery('count', filter);
  };

  Model.create = async function(data) {
    if (mongoose.connection.readyState === 1) return await origCreate(data);
    if (!db[collKey]) db[collKey] = [];
    const docData = Array.isArray(data) ? data : [data];
    const createdList = docData.map(item => {
      const obj = {
        _id: item._id || db.generateId(),
        ...item,
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date()
      };
      db[collKey].unshift(obj);
      return obj;
    });
    return Array.isArray(data) ? createdList : createdList[0];
  };

  return Model;
};

