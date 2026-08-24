export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fa-IR').format(num);
};

export const formatDate = (dateStr: string): string => {
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
