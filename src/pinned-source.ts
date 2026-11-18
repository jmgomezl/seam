// Pinned historical source, transpiled without changing function bodies. MIT license in public/licenses.
export const compiledAdapters = {
  "before": "function formatAmount(amount, currency) {\n    if (amount == null)\n        return 'N/A';\n    return `$${(amount / 100).toFixed(2)} ${(currency ?? 'usd').toUpperCase()}`;\n}\n",
  "fixed": "function formatCurrencyAmount(amount, currency) {\n    const currencyCode = currency.toUpperCase();\n    try {\n        const formatter = new Intl.NumberFormat('en-US', {\n            style: 'currency',\n            currency: currencyCode,\n        });\n        const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;\n        return formatter.format(amount / 10 ** fractionDigits);\n    }\n    catch {\n        return `${amount} ${currency}`;\n    }\n}\n\nfunction formatAmount(amount, currency) {\n    if (amount == null)\n        return 'N/A';\n    return formatCurrencyAmount(amount, currency ?? 'usd');\n}\n"
};
export const pinnedSource = {
  "before": "function formatAmount(\n  amount?: number | null,\n  currency?: string | null,\n): string {\n  if (amount == null) return 'N/A';\n  return `$${(amount / 100).toFixed(2)} ${(currency ?? 'usd').toUpperCase()}`;\n}\n",
  "fixed": "function formatAmount(\n  amount?: number | null,\n  currency?: string | null,\n): string {\n  if (amount == null) return 'N/A';\n  return formatCurrencyAmount(amount, currency ?? 'usd');\n}\n",
  "helper": "export function formatAmount(amount: number, currency: string): string {\n  const currencyCode = currency.toUpperCase();\n\n  try {\n    const formatter = new Intl.NumberFormat('en-US', {\n      style: 'currency',\n      currency: currencyCode,\n    });\n    const fractionDigits =\n      formatter.resolvedOptions().maximumFractionDigits ?? 2;\n    return formatter.format(amount / 10 ** fractionDigits);\n  } catch {\n    return `${amount} ${currency}`;\n  }\n}\n",
  "metadata": {
    "repository": "stripe/link-cli",
    "beforeRevision": "8d46e6b0da0425b5cd9db208a100a96f4feff3fa",
    "fixedRevision": "7d80ee989e8ea7e69beab3562b67ba6820ed3eb3",
    "path": "packages/cli/src/commands/ucp/checkout-summary.tsx",
    "beforeExtractSha256": "0091eb3b70a4964b1653fdd509b055fd5f753ccb2ba511fb01391149f3dfe280",
    "fixedExtractSha256": "2bef22020dc4536fd06b6010680478fc840b2791586f74beb204c530fdcda0e2",
    "helperExtractSha256": "a39f002abc1fe727f42126723627df8a58f7a59b3c2334ead372f74953280088"
  }
};

export const vendorLicense = "MIT License\n\nCopyright (c) 2026 Stripe, LLC\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.";
