export function getSupabasePublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isWaasTestMode() {
  const value = process.env.WAAS_TEST_MODE ?? process.env.NEXT_PUBLIC_WAAS_TEST_MODE ?? "";
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function isPublishingPaused() {
  const value = process.env.PUBLISHING_PAUSED ?? process.env.NEXT_PUBLIC_PUBLISHING_PAUSED;
  if (!value) return true;
  return !["0", "false", "no", "off"].includes(value.toLowerCase());
}

export function hasSupabaseBrowserConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabasePublishableKey());
}

export function getMissingSupabaseBrowserConfig() {
  const missing = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!getSupabasePublishableKey()) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return missing;
}

export function hasSupabaseServiceConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublishableKey() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getMissingSupabaseServiceConfig() {
  return [
    ...getMissingSupabaseBrowserConfig(),
    ...(!process.env.SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : [])
  ];
}

export function productionConfigError(message: string, missing: string[] = []) {
  return {
    error: message,
    missing
  };
}
