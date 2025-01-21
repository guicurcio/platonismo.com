/**
 * Safely computes `n mod m` such that the result is always in the range `[0, m)`.
 * This function correctly handles negative values of `n` by shifting them into
 * the positive range.
 *
 * @param {number} n - The dividend.
 * @param {number} m - The divisor, must not be zero.
 * @throws {TypeError} If `n` or `m` is not a finite number.
 * @throws {RangeError} If `m` is zero.
 * @returns {number} The positive remainder of `n` divided by `m`.
 *
 * @example
 * mod(5, 3);   // returns 2
 * mod(-5, 3);  // returns 1 (instead of -2)
 */
export function mod(n: number, m: number): number {
    if (!Number.isFinite(n)) {
      throw new TypeError(`Invalid argument "n": ${n}. Must be a finite number.`);
    }
    if (!Number.isFinite(m)) {
      throw new TypeError(`Invalid argument "m": ${m}. Must be a finite number.`);
    }
    if (m === 0) {
      throw new RangeError('Divisor "m" cannot be zero.');
    }
  
    return ((n % m) + m) % m;
  }
  