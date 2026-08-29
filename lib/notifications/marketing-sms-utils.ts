export const MARKETING_SMS_FOOTER = "Pink Beauty. Reply STOP to opt out.";
export const MARKETING_SMS_MAX_LENGTH = 480;

export function prepareMarketingSms(message: string) {
  const body = message.trim();
  return body ? `${body}\n\n${MARKETING_SMS_FOOTER}` : "";
}

export function validateMarketingSms(message: string) {
  const prepared = prepareMarketingSms(message);
  if (!prepared) return "Enter a promotional message.";
  if (prepared.length > MARKETING_SMS_MAX_LENGTH)
    return `Keep the complete SMS to ${MARKETING_SMS_MAX_LENGTH} characters or fewer.`;
  return null;
}
