/**
 * Bounding box for Bangladesh
 * Lat: 20.5 to 26.7
 * Lng: 88.0 to 92.7
 */
export const BD_BOUNDS = {
  southWest: [20.5, 88.0] as [number, number],
  northEast: [26.7, 92.7] as [number, number],
};

/**
 * Checks if the given latitude and longitude fall within the approximate bounding box of Bangladesh.
 */
export function isWithinBangladesh(lat: number, lng: number): boolean {
  return (
    lat >= BD_BOUNDS.southWest[0] &&
    lat <= BD_BOUNDS.northEast[0] &&
    lng >= BD_BOUNDS.southWest[1] &&
    lng <= BD_BOUNDS.northEast[1]
  );
}
