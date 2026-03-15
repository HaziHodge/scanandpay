/**
 * Formats a number to Chilean Pesos (CLP)
 * @param {number} amount
 * @returns {string} Formatted amount (e.g., "$12.500")
 */
export const formatCLP = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};
