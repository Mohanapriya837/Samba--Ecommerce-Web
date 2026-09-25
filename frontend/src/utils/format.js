const currency = import.meta.env.VITE_CURRENCY || 'USD';
const priceFmt = new Intl.NumberFormat(undefined, { style: 'currency', currency });

export const formatPrice = (value) => priceFmt.format(Number(value || 0));

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Mirrors the transitions enforced by the backend
export const NEXT_STATUSES = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const PAYMENT_LABELS = { COD: 'Cash on delivery', CARD: 'Credit / debit card', UPI: 'UPI' };
