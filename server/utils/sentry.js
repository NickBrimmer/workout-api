import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { v4 as uuidv4 } from "uuid";

import config from "config";

const correlationId = uuidv4();

let sentryDSN = "";
if (config.has("Sentry.DSN")) {
  sentryDSN = config.get("Sentry.DSN");
}

let environment = "";
if (config.has("Sentry.ENV")) {
  environment = config.get("Sentry.ENV");
}

Sentry.init({
  dsn: sentryDSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  debug: true,
  environment,
  attachStacktrace: true,
});

Sentry.setUser({ ip_address: "{{auto}}" });

export default Sentry;
