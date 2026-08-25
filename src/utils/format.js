/**
 * Format utilities for currency, numbers, and dates
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
