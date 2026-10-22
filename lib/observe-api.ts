import { randomUUID } from "crypto";
import { logApplicationEvent } from "@/lib/observability";

/** Logs handled 5xx responses; uncaught errors are captured by Next instrumentation. */
export function observeApi<Args extends unknown[]>(route: string, handler: (...args: Args) => Response | Promise<Response>) {
  return async (...args: Args) => {
    const response = await handler(...args);
    if (response.status >= 400) {
      const requestId = randomUUID();
      logApplicationEvent(response.status >= 500 ? "api_error_response" : "api_rejected", response.status >= 500 ? "ERROR" : "WARN", { operation: "request", route, status: response.status, requestId });
      response.headers.set("x-pink-request-id", requestId);
    }
    return response;
  };
}
