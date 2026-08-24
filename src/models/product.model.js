import { db } from './db.js';

/**
 * Product Model - محصول
 * هر محصول شامل: اسم (name)، توضیحات (description)، قیمت (price)،
 * وضعیت موجودی (isAvailable) و نظرات (reviews) می‌باشد.
 */
export const ProductModel = {
  find: async (filter = {}) => {
    let list = [...db.products];

    if (filter.category) {
      list = list.filter(p => p.category === filter.category);
    }
    if (filter.isAvailable !== undefined) {
      const isAvail = filter.isAvailable === 'true' || filter.isAvailable === true;
      list = list.filter(p => Boolean(p.isAvailable) === isAvail);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (filter.minPrice !== undefined) {
      list = list.filter(p => p.price >= Number(filter.minPrice));
    }
    if (filter.maxPrice !== undefined) {
      list = list.filter(p => p.price <= Number(filter.maxPrice));
    }

    // Attach latest reviews to each product
    list = list.map(prod => {
      const productReviews = db.reviews.filter(r => r.productId === prod._id);
      return {
        ...prod,
        name: prod.name || prod.title,
        title: prod.title || prod.name,
        isAvailable: prod.isAvailable !== undefined ? prod.isAvailable : (prod.countInStock > 0),
        reviews: productReviews
      };
    });

    // Sorting
    if (filter.sortBy) {
      if (filter.sortBy === 'price-asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (filter.sortBy === 'price-desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (filter.sortBy === 'newest') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return list;
  },

  findById: async (id) => {
    const prod = db.products.find(p => p._id === id || p.slug === id);
    if (!prod) return null;

    const productReviews = db.reviews.filter(r => r.productId === prod._id);
    return {
      ...prod,
      name: prod.name || prod.title,
      title: prod.title || prod.name,
      isAvailable: prod.isAvailable !== undefined ? prod.isAvailable : (prod.countInStock > 0),
      reviews: productReviews
    };
  },

  create: async (data) => {
    const productName = data.name || data.title || 'محصول بدون نام';
    const isAvailable = data.isAvailable !== undefined 
      ? Boolean(data.isAvailable) 
      : (data.countInStock !== undefined ? Number(data.countInStock) > 0 : true);

    const newProduct = {
      _id: data._id || db.generateId(),
      name: productName,
      title: productName,
      description: data.description || '',
      price: Number(data.price) || 0,
      isAvailable: isAvailable,
      countInStock: isAvailable ? (Number(data.countInStock) || 10) : 0,
      category: data.category || 'عمومی',
      image: data.image || (Array.isArray(data.images) ? data.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'),
      images: Array.isArray(data.images) && data.images.length > 0 
        ? data.images 
        : [data.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.unshift(newProduct);
    return newProduct;
  },

  findByIdAndUpdate: async (id, updateData) => {
    const index = db.products.findIndex(p => p._id === id || p.slug === id);
    if (index === -1) return null;

    const current = db.products[index];
    const updatedName = updateData.name || updateData.title || current.name || current.title;
    const isAvailable = updateData.isAvailable !== undefined 
      ? Boolean(updateData.isAvailable) 
      : (updateData.countInStock !== undefined ? Number(updateData.countInStock) > 0 : current.isAvailable);

    db.products[index] = {
      ...current,
      ...updateData,
      name: updatedName,
      title: updatedName,
      isAvailable: isAvailable,
      countInStock: isAvailable ? (updateData.countInStock || current.countInStock || 10) : 0,
      updatedAt: new Date().toISOString()
    };

    const productReviews = db.reviews.filter(r => r.productId === db.products[index]._id);
    return {
      ...db.products[index],
      reviews: productReviews
    };
  },

  findByIdAndDelete: async (id) => {
    const index = db.products.findIndex(p => p._id === id || p.slug === id);
    if (index === -1) return null;
    const deleted = db.products.splice(index, 1);
    return deleted[0];
  },

  countDocuments: async (filter = {}) => {
    const filtered = await ProductModel.find(filter);
    return filtered.length;
  }
};
