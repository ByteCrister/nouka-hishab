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
