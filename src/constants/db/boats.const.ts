export const BOAT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  DECOMMISSIONED: 'decommissioned'
} as const;
export type BoatStatus = typeof BOAT_STATUSES[keyof typeof BOAT_STATUSES];

export const BOAT_CAPACITY_UNITS = {
  CUBIC_FT: 'cubic_ft',
  TON: 'ton',
  CUBIC_M: 'cubic_m'
} as const;
export type BoatCapacityUnit = typeof BOAT_CAPACITY_UNITS[keyof typeof BOAT_CAPACITY_UNITS];



