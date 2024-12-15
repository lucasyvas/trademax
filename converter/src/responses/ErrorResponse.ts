import Response from "./Response";

type Props = { status: number; error: string };

export default class ErrorResponse extends Response {
  constructor({ status, error }: Props) {
    super({ status, content: error });
  }
}
