/**
 * Create a buffer
 * @param s
 */
export const bufferify = (s: Buffer | string | number | Uint8Array): Buffer => {
  if (!Buffer.isBuffer(s)) {
    return Buffer.from(s.toString());
  }
  return s;
};
