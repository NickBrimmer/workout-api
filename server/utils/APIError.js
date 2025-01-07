import { v4 as uuidv4 } from "uuid";

import Sentry from "./sentry";
import config from "config";

class ExtendableError extends Error {
  constructor(status, title, message) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.title = title;
    this.message = message;
    this.isPublic = true;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

class APIError extends ExtendableError {
  constructor(
    status = 500,
    title = "Internal Server Error",
    message = "An unknown server error occurred."
  ) {
    super(status, title, message);
  }

  logSentry() {
    Sentry.setTag("logger", "Sites API");
    Sentry.setTag("status", this.status);
    Sentry.setTag("title", this.title);
    Sentry.setTag("message", this.message);
    Sentry.setTag("correlationId", correlationId);
    Sentry.captureMessage(`Sites API Error: ${this.title}`);
  }
}
