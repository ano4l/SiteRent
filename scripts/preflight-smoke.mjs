#!/usr/bin/env node

const baseUrl = new URL(process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000");

const checks = [
  {
    name: "public marketing page",
    method: "GET",
    path: "/",
    expect: [200]
  },
  {
    name: "public login page",
    method: "GET",
    path: "/login",
    expect: [200]
  },
  {
    name: "dashboard requires login",
    method: "GET",
    path: "/dashboard",
    expect: [302, 303, 307, 308],
    locationIncludes: "/login"
  },
  {
    name: "admin requires login",
    method: "GET",
    path: "/admin",
    expect: [302, 303, 307, 308],
    locationIncludes: "/login"
  },
  {
    name: "protected AI API fails closed",
    method: "POST",
    path: "/api/ai/website-plan",
    expect: [401, 503],
    json: {
      mode: "create",
      businessContext: "Smoke test request with enough text to pass shape validation."
    }
  },
  {
    name: "invalid public enquiry is rejected",
    method: "POST",
    path: "/api/enquiries",
    expect: [400],
    json: {}
  },
  {
    name: "unsigned Peach webhook is rejected",
    method: "POST",
    path: "/api/peach/webhook",
    expect: [400],
    body: "",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    }
  }
];

function makeUrl(path) {
  return new URL(path, baseUrl).toString();
}

async function runCheck(check) {
  const headers = { ...(check.headers ?? {}) };
  let body = check.body;

  if (check.json !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(check.json);
  }

  const response = await fetch(makeUrl(check.path), {
    method: check.method,
    headers,
    body,
    redirect: "manual"
  });

  if (!check.expect.includes(response.status)) {
    throw new Error(`${check.name}: expected ${check.expect.join(" or ")}, got ${response.status}`);
  }

  if (check.locationIncludes) {
    const location = response.headers.get("location") ?? "";
    if (!location.includes(check.locationIncludes)) {
      throw new Error(`${check.name}: expected Location to include ${check.locationIncludes}, got ${location || "<empty>"}`);
    }
  }

  return response.status;
}

console.log(`Running SiteRent preflight smoke checks against ${baseUrl.origin}`);

const failures = [];

for (const check of checks) {
  try {
    const status = await runCheck(check);
    console.log(`OK ${check.name} (${status})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(message);
    console.error(`FAIL ${message}`);
  }
}

if (failures.length) {
  console.error("");
  console.error("Smoke checks failed. Start the app first, then rerun with:");
  console.error("  npm run dev");
  console.error("  npm run smoke");
  console.error("Use SMOKE_BASE_URL=https://your-preview.example.com to target a deployed preview.");
  process.exit(1);
}

console.log("");
console.log("Preflight smoke checks passed.");
