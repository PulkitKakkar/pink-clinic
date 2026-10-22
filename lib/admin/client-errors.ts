export type ClientErrorCode = "network" | "server_response" | "invalid_response" | "render" | "unhandled_rejection" | "image_upload";

// Only fixed category codes leave the browser. Never pass Error objects or form data.
export function reportClientError(code: ClientErrorCode) {
  void fetch("/api/admin/client-errors", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ code }), keepalive: true,
  }).catch(() => { /* Offline clients cannot reach monitoring; keep the form usable. */ });
}
