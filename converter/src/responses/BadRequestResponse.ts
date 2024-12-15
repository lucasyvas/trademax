import ErrorResponse from "./ErrorResponse";

export default class BadRequestResponse extends ErrorResponse {
  constructor(error: string) {
    super({ status: 400, error });
  }
}
