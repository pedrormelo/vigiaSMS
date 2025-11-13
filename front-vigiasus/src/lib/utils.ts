import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a string of digits into CPF mask 000.000.000-00.
 * Accepts any string, strips non-digits, trims to 11.
 */
export function formatCPF(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);
  let out = part1;
  if (part2) out += `.${part2}`;
  if (part3) out += `.${part3}`;
  if (part4) out += `-${part4}`;
  return out;
}

/**
 * Validate Brazilian CPF.
 * Returns true for syntactically valid numbers (ignoring obviously invalid sequences like all same digits).
 */
export function validateCPF(input: string): boolean {
  const cpf = input.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  // reject all equal digits
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i], 10) * (10 - i);
  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;
  if (check1 !== parseInt(cpf[9], 10)) return false;
  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i], 10) * (11 - i);
  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;
  return check2 === parseInt(cpf[10], 10);
}
