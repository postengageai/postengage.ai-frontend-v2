import { setUnauthorizedHandler } from './client';

// Global handler for unauthorized responses
let logoutHandler: (() => void) | null = null;

// Set the logout handler for 401 responses
export function setLogoutHandler(handler: () => void) {
  logoutHandler = handler;
  setUnauthorizedHandler(handler);
}

// Get the current logout handler
export function getLogoutHandler() {
  return logoutHandler;
}

// Initialize the HTTP client with default handler
export function initializeHttpClient() {
  // Set a default handler that logs a warning
  setUnauthorizedHandler(() => {
    // eslint-disable-next-line no-console
    console.warn(
      'Unauthorized access detected. Please setup proper logout handler.'
    );
  });
}
