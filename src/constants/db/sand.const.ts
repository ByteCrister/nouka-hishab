export const SAND_TRIP_STATUSES = {
  SCHEDULED: 'scheduled',
  LOADING: 'loading',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;
export type SandTripStatus = typeof SAND_TRIP_STATUSES[keyof typeof SAND_TRIP_STATUSES];

export const SAND_CARGO_UNITS = {
  CUBIC_FT: 'cubic_ft',
  TON: 'ton',
  CUBIC_M: 'cubic_m'
} as const;
export type SandCargoUnit = typeof SAND_CARGO_UNITS[keyof typeof SAND_CARGO_UNITS];

export const SAND_TRIP_EXPENSE_CATEGORIES = {
  FUEL: 'fuel',
  LABOUR: 'labour',
  MAINTENANCE: 'maintenance',
  TOLL_PAYMENT: 'toll_payment',
  LOADING_FEE: 'loading_fee',
  ENGINE_REPAIR: 'engine_repair',
  OTHER: 'other'
} as const;
export type SandTripExpenseCategory = typeof SAND_TRIP_EXPENSE_CATEGORIES[keyof typeof SAND_TRIP_EXPENSE_CATEGORIES];

