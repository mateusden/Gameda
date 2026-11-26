export const MIN_AGE = 16;

export function maskDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// dd/mm/aaaa -> aaaa-mm-dd (null se a data não existir)
export function brToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd)
  ) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

function todayIso() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

export function isValidIsoDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return false;
  }
  return y >= 1900 && iso <= todayIso();
}

export function isOldEnough(iso: string, min = MIN_AGE) {
  const [y, m, d] = iso.split("-").map(Number);
  const [ty, tm, td] = todayIso().split("-").map(Number);
  let age = ty - y;
  if (tm < m || (tm === m && td < d)) age--;
  return age >= min;
}