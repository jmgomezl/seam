import {formatAmount as formatCurrencyAmount} from './helper.ts';
function formatAmount(
  amount?: number | null,
  currency?: string | null,
): string {
  if (amount == null) return 'N/A';
  return formatCurrencyAmount(amount, currency ?? 'usd');
}

export {formatAmount};
