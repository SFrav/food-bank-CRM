//Helper functions
export const formatDate = (date: string | null): string => {
  if (!date) return 'No date';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

//@remove this when possible
export const formatCurrency = (amount: number, currency = 'IDR'): string => {
  const decimals = currency === 'IDR' || currency === 'JPY' ? 0 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};