export function getPublicOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedHost && (forwardedProtocol === "http" || forwardedProtocol === "https")) {
    return `${forwardedProtocol}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}
