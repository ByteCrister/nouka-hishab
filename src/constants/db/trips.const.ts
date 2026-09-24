export const TRIP_EXPENSE_CATEGORIES = {
  FUEL: 'fuel',
  LABOUR: 'labour',
  MAINTENANCE: 'maintenance',
  TOLL_PAYMENT: 'toll_payment',
  LOADING_FEE: 'loading_fee',
  ENGINE_REPAIR: 'engine_repair',
  OTHER: 'other'
} as const;
export type TripExpenseCategory = typeof TRIP_EXPENSE_CATEGORIES[keyof typeof TRIP_EXPENSE_CATEGORIES];
