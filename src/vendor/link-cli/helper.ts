export function formatAmount(amount: number, currency: string): string {
  const currencyCode = currency.toUpperCase();

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    });
    const fractionDigits =
      formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(amount / 10 ** fractionDigits);
  } catch {
    return `${amount} ${currency}`;
  }
}
