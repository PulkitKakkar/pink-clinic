import { afterEach, describe, expect, it, vi } from 'vitest';
const send = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/client-secrets-manager', () => ({ SecretsManagerClient: class { send = send; }, GetSecretValueCommand: class { constructor(public input: unknown) {} } }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); send.mockReset(); });
describe('runtime secrets', () => {
  it('rejects attempts to inject public or AWS credential configuration', async () => {
    const { parseRuntimeSecrets } = await import('./runtime-secrets');
    for (const value of ['null','[]','{"AWS_SECRET_ACCESS_KEY":"bad"}','{"NEXT_PUBLIC_SECRET":"bad"}','{"ADMIN_PASSWORD":42}']) expect(() => parseRuntimeSecrets(value)).toThrow();
  });
  it('loads once for concurrent startup and proxy callers', async () => {
    vi.stubEnv('RUNTIME_SECRET_ARN','test-secret'); vi.stubEnv('ADMIN_PASSWORD','old');
    send.mockResolvedValue({ SecretString: '{"ADMIN_PASSWORD":"new"}' });
    const { loadRuntimeSecrets } = await import('./runtime-secrets');
    await Promise.all([loadRuntimeSecrets(),loadRuntimeSecrets()]);
    expect(send).toHaveBeenCalledTimes(1); expect(process.env.ADMIN_PASSWORD).toBe('new');
  });
  it('fails closed without leaking diagnostics or publishing partial values and allows retry', async () => {
    vi.stubEnv('RUNTIME_SECRET_ARN','test-secret'); vi.stubEnv('ADMIN_PASSWORD','old');
    send.mockResolvedValueOnce({ SecretString: '{"ADMIN_PASSWORD":"new","AWS_SECRET_ACCESS_KEY":"sensitive"}' });
    const { loadRuntimeSecrets } = await import('./runtime-secrets');
    await expect(loadRuntimeSecrets()).rejects.toThrow('Unable to load application runtime secrets.');
    expect(process.env.ADMIN_PASSWORD).toBe('old');
    send.mockResolvedValueOnce({ SecretString: '{"ADMIN_PASSWORD":"valid"}' });
    await loadRuntimeSecrets(); expect(process.env.ADMIN_PASSWORD).toBe('valid');
  });
  it('leaves local environment configuration untouched when no secret is configured', async () => {
    vi.stubEnv('RUNTIME_SECRET_ARN','');
    const { loadRuntimeSecrets } = await import('./runtime-secrets'); await loadRuntimeSecrets(); expect(send).not.toHaveBeenCalled();
  });
});
