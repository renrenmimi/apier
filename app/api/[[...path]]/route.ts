// Server-side mock API -- local development only.
//
// Visitors of the deployed site never touch this. Their mock runs inside their
// own browser (Service Worker + IndexedDB) under /mock-api, so no two people
// share state. This route exists purely so that someone who has cloned the repo
// can drive the same engine from a terminal with curl.
//
// It is disabled on a serverless host on purpose: one process-wide store there
// would be shared between visitors on a warm instance and would silently vanish
// when a different instance answered, which is the bug this branch removes.

import { createSeedStore, type MockStore } from "@/lib/mock/seed";
import { handleMockRequest } from "@/lib/mock/engine";
import { json, preflight, problem } from "@/lib/mock/http";

export const dynamic = "force-dynamic";

const BASE_PATH = "/api";

/**
 * True when this build runs on a shared serverless host rather than on
 * somebody's own machine. VERCEL is set on every Vercel deployment;
 * APIER_DISABLE_SERVER_MOCK lets any other host opt in to the same behaviour.
 */
function isSharedHost() {
  return Boolean(process.env.VERCEL) || process.env.APIER_DISABLE_SERVER_MOCK === "1";
}

// One store per server process. Safe locally (a single developer), which is why
// it is only ever reached when isSharedHost() is false. Held on globalThis so a
// dev-server hot reload does not wipe the developer's edits mid-session.
const globalRef = globalThis as { __apierDevStore?: MockStore };
function devStore(): MockStore {
  return (globalRef.__apierDevStore ??= createSeedStore());
}

function disabledResponse(pathname: string) {
  if (pathname.replace(/\/+$/, "") === BASE_PATH) {
    // The index still answers, because it is documentation rather than state.
    return json(
      {
        name: "APIer Mock API",
        scope: "disabled-on-shared-host",
        message:
          "This deployment does not run a server-side mock. Each visitor's mock API runs inside their own browser at /mock-api (Service Worker + IndexedDB), so nobody can see or change anybody else's data.",
        interactive: "Open any chapter with a request inspector; it talks to /mock-api in your browser.",
        terminal:
          "To drive the same engine from curl, clone the repository and run `npm run dev`, then call http://localhost:3300/api.",
      },
      { status: 200, headers: { "X-Mock-Scope": "disabled-on-shared-host" } },
    );
  }
  return problem({
    status: 501,
    title: "Server Mock Disabled",
    detail:
      "This endpoint only runs on a local clone. On the deployed site the mock API lives in your browser at /mock-api, so that one visitor can never mutate another visitor's data. Clone the repository and run `npm run dev` to use this from a terminal.",
    headers: { "X-Mock-Scope": "disabled-on-shared-host" },
  });
}

async function route(req: Request) {
  const { pathname } = new URL(req.url);
  if (isSharedHost()) {
    return req.method.toUpperCase() === "OPTIONS" ? preflight() : disabledResponse(pathname);
  }
  const { response } = await handleMockRequest(devStore(), req, {
    basePath: BASE_PATH,
    scope: "local-dev-server",
  });
  return response;
}

export const GET = route;
export const POST = route;
export const PUT = route;
export const PATCH = route;
export const DELETE = route;
export const HEAD = route;
export const OPTIONS = route;
