const allowedProtocols = new Set(["http:", "https:"]);

export function getPublicOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const url = new URL(configured);
    if (allowedProtocols.has(url.protocol)) return url.origin;
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedHost && (forwardedProtocol === "http" || forwardedProtocol === "https")) {
    return `${forwardedProtocol}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}
