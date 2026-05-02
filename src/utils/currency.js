// frontend/src/utils/currency.js

// Format price as Saudi Riyal (SAR)
export const formatSAR = (price) => {
  if (price === undefined || price === null) return "0 ﷼";
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0 ﷼";
  return `${numPrice.toFixed(2)} ﷼`;
};

// Format price without decimals
export const formatSARSimple = (price) => {
  if (price === undefined || price === null) return "0 ﷼";
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0 ﷼";
  return `${Math.round(numPrice)} ﷼`;
};

// Parse SAR string to number
export const parseSAR = (sarString) => {
  if (!sarString) return 0;
  const match = sarString.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

// Get SAR symbol
export const getSARIcon = () => "﷼";

// Format with Intl API
export const toSAR = (amount) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const CURRENCY = {
  code: "SAR",
  symbol: "﷼",
  name: "Saudi Riyal",
  locale: "ar-SA",
};