export function formatSAR(value) {
  if (value === null || value === undefined || value === '') return '0 ر.س';
  const num = parseFloat(value);
  if (isNaN(num)) return '0 ر.س';
  return num.toLocaleString('en-US') + ' ر.س';
}
