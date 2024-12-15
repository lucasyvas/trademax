import ErrorResponse from "./ErrorResponse";

/**
 * A fallback error response for unhandled errors.
 *
 * This response is purposefully lacking detail so that clients will not
 * receive information that may give them hints on how to exploit the system.
 * More detailed information about the cause is available in application logs.
 */
export default class InternalServerErrorResponse extends ErrorResponse {
  constructor() {
    super({ status: 500, error: "An unexpected error occurred" });
  }
}
