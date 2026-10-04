import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

/**
 * Minimal password hashing using Node's built-in `crypto.scrypt` — no extra
 * dependency (e.g. bcrypt/argon2) required for this scaffold. Swap this out
 * for `argon2`/`bcrypt` in a real auth module if you need tunable cost
 * parameters or a battle-tested audited implementation.
 *
 * Stored format: `<salt-hex>:<hash-hex>`.
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(plain, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const derivedKey = (await scrypt(plain, salt, KEY_LENGTH)) as Buffer;
  const storedBuffer = Buffer.from(hash, 'hex');

  return derivedKey.length === storedBuffer.length && timingSafeEqual(derivedKey, storedBuffer);
}
