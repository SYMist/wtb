/** km/h → m/s */
export function kmhToMs(kmh: number): number {
  return Math.round((kmh / 3.6) * 100) / 100;
}

/** km/h → mph */
export function kmhToMph(kmh: number): number {
  return Math.round((kmh / 1.60934) * 100) / 100;
}

/** m/s → km/h */
export function msToKmh(ms: number): number {
  return Math.round(ms * 3.6 * 100) / 100;
}

/** m/s → mph */
export function msToMph(ms: number): number {
  return Math.round((ms * 3.6 / 1.60934) * 100) / 100;
}

/** mph → km/h */
export function mphToKmh(mph: number): number {
  return Math.round(mph * 1.60934 * 100) / 100;
}

/** mph → m/s */
export function mphToMs(mph: number): number {
  return Math.round((mph * 1.60934 / 3.6) * 100) / 100;
}
