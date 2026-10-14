import { parsePhoneNumberFromString } from "libphonenumber-js";

/** Aceita telefone brasileiro sem país ou um formato internacional iniciado por +. */
export function normalizePhone(value: string) {
  const input = value.trim();
  if (!/^\+?[\d\s()\-]+$/.test(input)) return null;
  if (input.replace(/\D/g, "").length > 15) return null;
  const phone = parsePhoneNumberFromString(input, "BR");
  return phone?.isValid() ? phone.number : null;
}
