/**
 * LoggedError is an error that was already logged.
 * It interrupts control flow but doesn't need further logging when caught.
 */
export class LoggedError extends Error {}
