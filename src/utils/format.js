/**
 * Format utilities for currency, numbers, dates, and server image URLs
 */

export const formatPrice = (price) => {
  if (price === undefined || price === null) return '۰ تومان';
  return new Intl.NumberFormat('fa-IR').format(Number(price) || 0) + ' تومان';
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return '۰';
  return new Intl.NumberFormat('fa-IR').format(Number(num) || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateStr;
  }
};

/**
 * Format image path to full server URL accessible by frontend
 */
export const formatImageUrl = (imagePath, req) => {
  if (!imagePath) return '';
  if (typeof imagePath !== 'string') return imagePath;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  if (req && req.headers && req.headers.host) {
    const protocol = req.protocol || 'http';
    return `${protocol}://${req.headers.host}${cleanPath}`;
  }
  return cleanPath;
};
