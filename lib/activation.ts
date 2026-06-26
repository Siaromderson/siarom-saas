import { randomBytes } from "crypto";

// Geração e validação de chaves de ativação dos planos pagos.
// Formato: SIAROM-XXXX-XXXX-XXXX (sem caracteres ambíguos).

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I

export function generateActivationKey(): string {
  const bytes = randomBytes(12);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  const block = (i: number) => chars.slice(i * 4, i * 4 + 4).join("");
  return `SIAROM-${block(0)}-${block(1)}-${block(2)}`;
}

const KEY_RE = /^SIAROM-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function normalizeKey(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidKeyFormat(input: string): boolean {
  return KEY_RE.test(normalizeKey(input));
}
