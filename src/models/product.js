import { db } from './db.js';

/**
 * Product Model - مدل محصول (برنج، نیم دانه برنج، ریز دانه برنج)
 * هر محصول شامل: اسم (name)، توضیحات (description)، قیمت (price)،
 * وضعیت موجودی (isAvailable) و نظرات (reviews) می‌باشد.
 */
export const ProductModel = {
  find: async (filter = {}) => {
    let list = [...db.products];

    // Search query in name and description
    const searchTerm = filter.search || filter.q;
    if (searchTerm) {
      const q = String(searchTerm).trim().toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Availability filter
    if (filter.isAvailable !== undefined) {
      const isAvail = filter.isAvailable === 'true' || filter.isAvailable === true;
      list = list.filter(p => Boolean(p.isAvailable) === isAvail);
    }

    // Price range filters
    if (filter.minPrice !== undefined && !isNaN(Number(filter.minPrice))) {
      list = list.filter(p => p.price >= Number(filter.minPrice));
    }
    if (filter.maxPrice !== undefined && !isNaN(Number(filter.maxPrice))) {
      list = list.filter(p => p.price <= Number(filter.maxPrice));
    }

    // Attach latest reviews to each product
    list = list.map(prod => {
      const productReviews = db.reviews.filter(r => r.productId === prod._id);
      return {
        _id: prod._id,
        name: prod.name,
        description: prod.description || '',
        price: Number(prod.price) || 0,
        isAvailable: prod.isAvailable !== undefined ? Boolean(prod.isAvailable) : (prod.countInStock > 0),
        countInStock: prod.countInStock !== undefined ? Number(prod.countInStock) : 10,
        image: prod.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
        reviews: productReviews,
        createdAt: prod.createdAt || new Date().toISOString(),
        updatedAt: prod.updatedAt || new Date().toISOString()
      };
    });

    // Sorting
    if (filter.sortBy) {
      if (filter.sortBy === 'price-asc' || filter.sortBy === 'cheapest') {
        list.sort((a, b) => a.price - b.price);
      } else if (filter.sortBy === 'price-desc' || filter.sortBy === 'expensive') {
        list.sort((a, b) => b.price - a.price);
      } else if (filter.sortBy === 'newest') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return list;
  },

  findById: async (id) => {
    const prod = db.products.find(p => p._id === id);
    if (!prod) return null;

    const productReviews = db.reviews.filter(r => r.productId === prod._id);
    return {
      _id: prod._id,
      name: prod.name,
      description: prod.description || '',
      price: Number(prod.price) || 0,
      isAvailable: prod.isAvailable !== undefined ? Boolean(prod.isAvailable) : (prod.countInStock > 0),
      countInStock: prod.countInStock !== undefined ? Number(prod.countInStock) : 10,
      image: prod.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      reviews: productReviews,
      createdAt: prod.createdAt || new Date().toISOString(),
      updatedAt: prod.updatedAt || new Date().toISOString()
    };
  },

  create: async (data) => {
    const productName = data.name || 'محصول برنج بدون نام';
    const isAvailable = data.isAvailable !== undefined 
      ? Boolean(data.isAvailable) 
      : (data.countInStock !== undefined ? Number(data.countInStock) > 0 : true);

    const newProduct = {
      _id: data._id || db.generateId(),
      name: productName,
      description: data.description || '',
      price: Number(data.price) || 0,
      isAvailable: isAvailable,
      countInStock: isAvailable ? (Number(data.countInStock) || 10) : 0,
      image: data.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.unshift(newProduct);
    return newProduct;
  },

  findByIdAndUpdate: async (id, updateData) => {
    const index = db.products.findIndex(p => p._id === id);
    if (index === -1) return null;

    const current = db.products[index];
    const updatedName = updateData.name || current.name;
    const isAvailable = updateData.isAvailable !== undefined 
      ? Boolean(updateData.isAvailable) 
      : (updateData.countInStock !== undefined ? Number(updateData.countInStock) > 0 : current.isAvailable);

    db.products[index] = {
      ...current,
      ...updateData,
      name: updatedName,
      isAvailable: isAvailable,
      countInStock: isAvailable ? (updateData.countInStock !== undefined ? Number(updateData.countInStock) : current.countInStock) : 0,
      updatedAt: new Date().toISOString()
    };

    const productReviews = db.reviews.filter(r => r.productId === db.products[index]._id);
    return {
      ...db.products[index],
      reviews: productReviews
    };
  },

  findByIdAndDelete: async (id) => {
    const index = db.products.findIndex(p => p._id === id);
    if (index === -1) return null;
    const deleted = db.products.splice(index, 1);
    return deleted[0];
  },

  countDocuments: async (filter = {}) => {
    const filtered = await ProductModel.find(filter);
    return filtered.length;
  }
};
