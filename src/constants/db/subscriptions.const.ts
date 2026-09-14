export const BILLING_PERIODS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const;
export type BillingPeriod = typeof BILLING_PERIODS[keyof typeof BILLING_PERIODS];

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending'
} as const;
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUSES[keyof typeof SUBSCRIPTION_STATUSES];

export const PAYMENT_METHODS = {
  BKASH: 'bkash',
  NAGAD: 'nagad',
  ROCKET: 'rocket',
  MANUAL: 'manual'
} as const;
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PLATFORM_ACCOUNT_TYPES = {
  BKASH: 'bkash',
  NAGAD: 'nagad',
  ROCKET: 'rocket',
  BANK: 'bank'
} as const;
export type PlatformAccountType = typeof PLATFORM_ACCOUNT_TYPES[keyof typeof PLATFORM_ACCOUNT_TYPES];

