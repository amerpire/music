/**
 * Uses math and date to generate a unique string.
 *
 * @returns a unique string.
 */
export function generateUniqueString(): string {
  return Math.random().toString(36).split('.')[1] + new Date().getTime();
}
