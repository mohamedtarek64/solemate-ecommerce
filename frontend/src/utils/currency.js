/**
 * Currency utilities for handling different currencies and conversions
 */

/**
 * Currency symbols and formatting
 */
export const currencyInfo = {
  EGP: { symbol: 'EGP', position: 'after', decimals: 2 },
  USD: { symbol: '$', position: 'before', decimals: 2 },
  EUR: { symbol: '€', position: 'after', decimals: 2 },
  GBP: { symbol: '£', position: 'before', decimals: 2 },
  SAR: { symbol: 'SAR', position: 'after', decimals: 2 },
  AED: { symbol: 'AED', position: 'after', decimals: 2 },
  KWD: { symbol: 'KWD', position: 'after', decimals: 3 },
  QAR: { symbol: 'QAR', position: 'after', decimals: 2 },
  BHD: { symbol: 'BHD', position: 'after', decimals: 3 },
  OMR: { symbol: 'OMR', position: 'after', decimals: 3 },
  JOD: { symbol: 'JOD', position: 'after', decimals: 3 },
  LBP: { symbol: 'LBP', position: 'after', decimals: 0 },
  IQD: { symbol: 'IQD', position: 'after', decimals: 0 },
  SYP: { symbol: 'SYP', position: 'after', decimals: 0 },
  LYD: { symbol: 'LYD', position: 'after', decimals: 3 },
  TND: { symbol: 'TND', position: 'after', decimals: 3 },
  DZD: { symbol: 'DZD', position: 'after', decimals: 2 },
  MAD: { symbol: 'MAD', position: 'after', decimals: 2 },
  SDG: { symbol: 'SDG', position: 'after', decimals: 2 },
  CAD: { symbol: 'C$', position: 'before', decimals: 2 },
  AUD: { symbol: 'A$', position: 'before', decimals: 2 },
  JPY: { symbol: '¥', position: 'before', decimals: 0 },
  CNY: { symbol: '¥', position: 'before', decimals: 2 },
  INR: { symbol: '₹', position: 'before', decimals: 2 },
  BRL: { symbol: 'R$', position: 'before', decimals: 2 },
  MXN: { symbol: '$', position: 'before', decimals: 2 },
  RUB: { symbol: '₽', position: 'after', decimals: 2 },
  TRY: { symbol: '₺', position: 'after', decimals: 2 },
  ZAR: { symbol: 'R', position: 'before', decimals: 2 },
  NGN: { symbol: '₦', position: 'before', decimals: 2 },
  KES: { symbol: 'KSh', position: 'before', decimals: 2 },
  GHS: { symbol: '₵', position: 'before', decimals: 2 }
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'EGP', options = {}) => {
  const {
    showSymbol = true,
    showDecimals = true,
    locale = 'en-US'
  } = options

  const currencyData = currencyInfo[currency] || currencyInfo.EGP
  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: showDecimals ? currencyData.decimals : 0,
    maximumFractionDigits: showDecimals ? currencyData.decimals : 0
  }).format(amount)

  if (!showSymbol) {
    return formattedAmount
  }

  if (currencyData.position === 'before') {
    return `${currencyData.symbol}${formattedAmount}`
  } else {
    return `${formattedAmount} ${currencyData.symbol}`
  }
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @param {Object} rates - Exchange rates
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, rates = {}) => {
  if (fromCurrency === toCurrency) {
    return amount
  }

  // Default exchange rates (you should get these from an API)
  const defaultRates = {
    USD: 1,
    EGP: 30.5,
    EUR: 0.85,
    GBP: 0.73,
    SAR: 3.75,
    AED: 3.67,
    KWD: 0.30,
    QAR: 3.64,
    BHD: 0.38,
    OMR: 0.38,
    JOD: 0.71,
    CAD: 1.25,
    AUD: 1.35,
    JPY: 110,
    CNY: 6.45,
    INR: 74,
    BRL: 5.2,
    MXN: 20,
    RUB: 73,
    TRY: 8.5,
    ZAR: 14.5,
    NGN: 410,
    KES: 110,
    GHS: 5.8
  }

  const exchangeRates = { ...defaultRates, ...rates }
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / exchangeRates[fromCurrency]
  const convertedAmount = usdAmount * exchangeRates[toCurrency]
  
  return Math.round(convertedAmount * 100) / 100
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency) => {
  return currencyInfo[currency]?.symbol || currency
}

/**
 * Get currency position
 * @param {string} currency - Currency code
 * @returns {string} Currency position ('before' or 'after')
 */
export const getCurrencyPosition = (currency) => {
  return currencyInfo[currency]?.position || 'after'
}

/**
 * Get currency decimals
 * @param {string} currency - Currency code
 * @returns {number} Number of decimal places
 */
export const getCurrencyDecimals = (currency) => {
  return currencyInfo[currency]?.decimals || 2
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @param {string} currency - Currency code
 * @returns {number} Parsed amount
 */
export const parseCurrency = (currencyString, currency = 'EGP') => {
  if (typeof currencyString === 'number') {
    return currencyString
  }

  const currencyData = currencyInfo[currency] || currencyInfo.EGP
  const symbol = currencyData.symbol
  
  // Remove currency symbol and spaces
  let cleanString = currencyString.replace(new RegExp(symbol, 'g'), '')
  cleanString = cleanString.replace(/,/g, '')
  cleanString = cleanString.trim()
  
  const amount = parseFloat(cleanString)
  return isNaN(amount) ? 0 : amount
}

/**
 * Calculate shipping cost based on country
 * @param {string} countryCode - Country code
 * @param {number} weight - Package weight in kg
 * @param {string} currency - Currency code
 * @returns {number} Shipping cost
 */
export const calculateShippingCost = (countryCode, weight = 1, currency = 'EGP') => {
  const shippingRates = {
    // Middle East & North Africa
    EG: { base: 50, perKg: 20 },
    SA: { base: 100, perKg: 30 },
    AE: { base: 120, perKg: 35 },
    KW: { base: 150, perKg: 40 },
    QA: { base: 150, perKg: 40 },
    BH: { base: 150, perKg: 40 },
    OM: { base: 150, perKg: 40 },
    JO: { base: 80, perKg: 25 },
    LB: { base: 80, perKg: 25 },
    IQ: { base: 100, perKg: 30 },
    SY: { base: 100, perKg: 30 },
    LY: { base: 100, perKg: 30 },
    TN: { base: 80, perKg: 25 },
    DZ: { base: 100, perKg: 30 },
    MA: { base: 100, perKg: 30 },
    SD: { base: 100, perKg: 30 },
    
    // Europe
    GB: { base: 200, perKg: 50 },
    DE: { base: 180, perKg: 45 },
    FR: { base: 180, perKg: 45 },
    IT: { base: 180, perKg: 45 },
    ES: { base: 180, perKg: 45 },
    
    // North America
    US: { base: 300, perKg: 80 },
    CA: { base: 280, perKg: 75 },
    MX: { base: 250, perKg: 70 },
    
    // Asia
    JP: { base: 250, perKg: 70 },
    CN: { base: 200, perKg: 60 },
    IN: { base: 150, perKg: 40 },
    
    // Default
    default: { base: 200, perKg: 50 }
  }

  const rate = shippingRates[countryCode] || shippingRates.default
  const cost = rate.base + (rate.perKg * weight)
  
  // Convert to target currency if needed
  if (currency !== 'EGP') {
    return convertCurrency(cost, 'EGP', currency)
  }
  
  return cost
}

/**
 * Calculate tax based on country
 * @param {number} amount - Amount to calculate tax for
 * @param {string} countryCode - Country code
 * @returns {number} Tax amount
 */
export const calculateTax = (amount, countryCode) => {
  const taxRates = {
    EG: 0.14, // 14% VAT
    SA: 0.15, // 15% VAT
    AE: 0.05, // 5% VAT
    KW: 0.00, // No VAT
    QA: 0.00, // No VAT
    BH: 0.10, // 10% VAT
    OM: 0.05, // 5% VAT
    US: 0.08, // Average 8% sales tax
    GB: 0.20, // 20% VAT
    DE: 0.19, // 19% VAT
    FR: 0.20, // 20% VAT
    default: 0.10 // 10% default
  }

  const taxRate = taxRates[countryCode] || taxRates.default
  return amount * taxRate
}
