type Props = { status: number; content?: string };

export default class Response {
  readonly status: number;
  readonly content: string | undefined;

  constructor({ status, content }: Props) {
    this.status = status;
    this.content = content;
  }
}
