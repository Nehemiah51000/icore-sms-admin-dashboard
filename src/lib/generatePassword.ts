// Excludes visually ambiguous characters (I, O, l, 0, 1) on purpose — this
// password is meant to be read aloud or copy-pasted into a WhatsApp message
// to a client, so avoiding characters that look alike matters more here
// than raw entropy density.
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';

export function generatePassword(length = 12): string {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => CHARSET[n % CHARSET.length]).join('');
}
