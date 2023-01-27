export const BFIT_TO_USD_COEFFICIENT = 0.2;

// TODO: not sure is adding (coming soon) here is a good idea, for now it's ok
export const SUPPORTED_CURRENCIES = {
  eur: {displayValue: 'EUR (coming soon)', symbol: '€', value: 'eur'},
  usd: {displayValue: 'USD', symbol: '$', value: 'usd'},
  gbp: {displayValue: 'GBP (coming soon)', symbol: '£', value: 'gbp'},
} as const;

export const BFIT_DECIMALS = 6;
