import SuccessResponse from "./SuccessResponse";

export default class NoContentResponse extends SuccessResponse {
  constructor() {
    super({ status: 204 });
  }
}
