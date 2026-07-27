export function normalizePhoneNumber(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("0044")) return `+44${digits.slice(4)}`;
  if (digits.startsWith("44")) return `+${digits}`;
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 10) return `+44${digits}`;
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

export function isStopMessage(message: string, optOutType?: string | null) {
  if (optOutType?.trim().toUpperCase() === "STOP") return true;
  return ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"].includes(
    message.trim().toUpperCase(),
  );
}
