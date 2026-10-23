const ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

let counter = 0;

export function createId(prefix = 'id'): string {
  counter += 1;

  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }

  const random = Array.from({ length: 6 }, () => ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)]).join('');
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${random}`;
}
