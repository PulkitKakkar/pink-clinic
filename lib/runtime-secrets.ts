import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

import secretKeys from "./runtime-secret-keys.json";
export const runtimeSecretKeys = secretKeys;

const allowedKeys = new Set<string>(runtimeSecretKeys);
let loading: Promise<void> | undefined;

export function parseRuntimeSecrets(value: string): Record<string, string> {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid runtime secret configuration.");
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(parsed)) {
    if (!allowedKeys.has(key) || typeof entry !== "string") throw new Error("Invalid runtime secret configuration.");
    result[key] = entry;
  }
  return result;
}

export async function loadRuntimeSecrets(): Promise<void> {
  const secretId = process.env.RUNTIME_SECRET_ARN;
  if (!secretId) return;
  if (!loading) {
    loading = (async () => {
      try {
        const client = new SecretsManagerClient({ region: process.env.RUNTIME_SECRET_REGION || process.env.AWS_REGION || "eu-west-2", maxAttempts: 3 });
        const secret = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
        if (!secret.SecretString) throw new Error("Missing secret payload.");
        const values = parseRuntimeSecrets(secret.SecretString);
        // Publish only after the entire payload has passed validation.
        Object.assign(process.env, values);
      } catch (error) {
        // Never include secret values or SDK diagnostics in startup logs.
        const knownNames = new Set(["CredentialsProviderError", "AccessDeniedException", "DecryptionFailure", "ResourceNotFoundException", "UnrecognizedClientException", "ExpiredTokenException", "TimeoutError", "NetworkingError", "InvalidRequestException", "InvalidParameterException", "InternalServiceError"]);
        const name = error instanceof Error && knownNames.has(error.name) ? error.name : "RuntimeConfigurationError";
        throw new Error("Unable to load application runtime secrets.", { cause: name });
      }
    })();
    loading.catch(() => { loading = undefined; });
  }
  await loading;
}
