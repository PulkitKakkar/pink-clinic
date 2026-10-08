export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.PINK_BUILD_PHASE !== "1" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { loadRuntimeSecrets } = await import("./lib/runtime-secrets");
    await loadRuntimeSecrets();
  }
}
