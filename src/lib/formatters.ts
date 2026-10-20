/**
 * Formats a number to Indian Rupee currency string
 * Example: 125000 -> ₹1,25,000
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format to Indian grouping standard
  const parts = absAmount.toFixed(0).split('.');
  let integerPart = parts[0];
  
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  
  return `${isNegative ? '-' : ''}₹${integerPart}`;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) to "21 Oct 2026"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Formats profit margin or general percentage
 */
export function formatPercentage(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }
  return `${val.toFixed(1)}%`;
}

/**
 * Check if a payment/billing date is overdue
 * Formula: billing_date < today AND pending_amount > 0
 */
export function isPaymentOverdue(billingDate?: string, pendingAmount: number = 0): boolean {
  if (!billingDate || pendingAmount <= 0) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(billingDate);
  targetDate.setHours(0, 0, 0, 0);
  
  return targetDate < today;
}

/**
 * Days remaining until billing date
 */
export function getDaysRemaining(billingDate?: string): { days: number; text: string; isPast: boolean } {
  if (!billingDate) return { days: 0, text: 'No date', isPast: false };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(billingDate);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return { days: 0, text: 'Due today', isPast: false };
  if (diffDays < 0) return { days: Math.abs(diffDays), text: `${Math.abs(diffDays)}d overdue`, isPast: true };
  return { days: diffDays, text: `Due in ${diffDays}d`, isPast: false };
}
