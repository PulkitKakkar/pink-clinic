import type { Instrumentation } from "next";
import { logApplicationEvent } from "@/lib/observability";

export const onRequestError: Instrumentation.onRequestError = (error, _request, context) => {
  logApplicationEvent("server_error", "ERROR", { operation: "request", route: context.routePath, error });
};
