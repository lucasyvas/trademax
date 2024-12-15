export type Segment = string;
export type Section = string[];
export type Element = string;
export type Content = { [segment: string]: Section[] };

export type RawOptions = { [option: string]: string };

export default class Document {
  readonly rawOptions: RawOptions;
  private readonly content: Content;

  constructor(content: Content, rawOptions: RawOptions = {}) {
    this.content = content;
    this.rawOptions = rawOptions;
  }

  getContent = (): Content => this.content;

  getSegments = (): readonly Segment[] => Object.keys(this.content);

  getElements = (segment: Segment): readonly Section[] => this.content[segment] ?? [];

  serialize = (): string => JSON.stringify(this.content);
}
