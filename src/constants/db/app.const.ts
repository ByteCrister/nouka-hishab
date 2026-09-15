export const SECTORS = {
  SAND: 'sand',
  LIME_STONE: 'lime-stone',
  BRICK: 'brick',
} as const;
export type SectorName = typeof SECTORS[keyof typeof SECTORS];
