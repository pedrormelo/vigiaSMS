import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata um CPF inserindo pontos e hífen conforme o usuário digita.
// Aceita qualquer string, extrai apenas dígitos e devolve no padrão XXX.XXX.XXX-XX.
// Se menos de 11 dígitos, retorna formatado parcialmente sem validar checksum.
export function formatCPF(value: string): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const parts: string[] = [];
  if (digits.length <= 3) return digits;
  parts.push(digits.slice(0, 3));
  if (digits.length <= 6) return parts[0] + "." + digits.slice(3);
  parts.push(digits.slice(3, 6));
  if (digits.length <= 9) return parts.join(".") + "." + digits.slice(6);
  parts.push(digits.slice(6, 9));
  const suffix = digits.slice(9);
  return parts.join(".") + "-" + suffix;
}

