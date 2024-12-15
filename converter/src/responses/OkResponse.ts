import SuccessResponse from "./SuccessResponse";

export default class OkResponse extends SuccessResponse {
  constructor(content: string) {
    super({ status: 200, content });
  }
}
