import { createHmac, timingSafeEqual } from "crypto";

export function twilioSignature(
  url: string,
  values: Iterable<[string, FormDataEntryValue]>,
  authToken: string,
) {
  const parameters = [...values]
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue),
    );
  const payload = parameters.reduce(
    (result, [key, value]) => `${result}${key}${value}`,
    url,
  );
  return createHmac("sha1", authToken).update(payload).digest("base64");
}

export function isValidTwilioSignature(
  supplied: string | null,
  expected: string,
) {
  if (!supplied) return false;
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
}

