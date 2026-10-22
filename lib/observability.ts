export type ApplicationEvent =
  | "api_rejected" | "api_error_response" | "server_error" | "consultation_save_failed" | "consultation_validation_failed"
  | "consultation_session_expired" | "consultation_autosave_succeeded"
  | "client_error" | "health_check_failed";

type EventDetails = {
  operation?: "create" | "update" | "autosave" | "upload" | "view" | "render" | "request" | "health";
  requestId?: string;
  route?: string;
  status?: number;
  validationCount?: number;
  clientCode?: "network" | "server_response" | "invalid_response" | "render" | "unhandled_rejection" | "image_upload";
  error?: unknown;
};

/** Deliberately excludes messages, stacks, URLs, headers and application payloads. */
export function logApplicationEvent(event: ApplicationEvent, severity: "INFO" | "WARN" | "ERROR", details: EventDetails = {}) {
  const error = details.error as { name?: unknown; code?: unknown } | undefined;
  const names = new Set(["TypeError", "SyntaxError", "RangeError", "PostgresError", "TimeoutError", "ConsultationStorageConfigurationError", "BookingConfigurationError", "AccessDenied", "NoSuchKey"]);
  const entry = {
    service: "pink-clinic", event, severity, timestamp: new Date().toISOString(),
    ...(details.route && /^\/[a-zA-Z0-9_/[\]-]{1,150}$/.test(details.route) && { route: details.route }),
    ...(details.operation && { operation: details.operation }),
    ...(details.requestId && /^[a-f0-9-]{36}$/i.test(details.requestId) && { requestId: details.requestId }),
    ...(details.status && { status: details.status }),
    ...(details.validationCount !== undefined && { validationCount: details.validationCount }),
    ...(details.clientCode && { clientCode: details.clientCode }),
    ...(error && { errorType: typeof error.name === "string" && names.has(error.name) ? error.name : "ApplicationError" }),
    ...(typeof error?.code === "string" && /^[0-9A-Z]{5}$/.test(error.code) && { databaseCode: error.code }),
  };
  const line = JSON.stringify(entry);
  if (severity === "ERROR") console.error(line);
  else if (severity === "WARN") console.warn(line);
  else console.info(line);
}
