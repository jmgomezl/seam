function formatAmount(
  amount?: number | null,
  currency?: string | null,
): string {
  if (amount == null) return 'N/A';
  return `$${(amount / 100).toFixed(2)} ${(currency ?? 'usd').toUpperCase()}`;
}

export {formatAmount};
