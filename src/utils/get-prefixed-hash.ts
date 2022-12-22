import { hashCode } from './get-hash';

export function getPrefixedHash(prefix: string, message: string): string {
  const messageHash = hashCode(message);
  return `${prefix}_${messageHash}`;
}
