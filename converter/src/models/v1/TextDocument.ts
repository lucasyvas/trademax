import Document, { Content, RawOptions } from "./Document";
import { ValidationError } from "../../errors";

export const DEFAULT_SEGMENT_DELIMETER = "~";
export const DEFAULT_ELEMENT_DELIMETER = "*";

export const DEFAULT_OPTIONS = {
  segmentdelim: DEFAULT_SEGMENT_DELIMETER,
  elementdelim: DEFAULT_ELEMENT_DELIMETER,
};

export default class TextDocument extends Document {
  static readonly mediaType = "application/vnd.trademax.txt";

  readonly segmentdelim: string;
  readonly elementDelimiter: string;

  constructor(content: Content, options: RawOptions = DEFAULT_OPTIONS) {
    const validatedOptions = TextDocument.validateOptions(options);

    super(content, options);

    this.segmentdelim = validatedOptions["segmentdelim"];
    this.elementDelimiter = validatedOptions["elementdelim"];
  }

  static fromDocument(document: Document, rawOptions?: RawOptions): TextDocument {
    return new TextDocument(document.getContent(), rawOptions);
  }

  static validateOptions(rawOptions: RawOptions) {
    if (rawOptions["segmentdelim"] && typeof rawOptions["segmentdelim"] !== "string") {
      throw new ValidationError("Invalid segmentdelim option");
    }

    if (rawOptions["elementdelim"] && typeof rawOptions["elementdelim"] !== "string") {
      throw new ValidationError("Invalid elementdelim option");
    }

    return {
      segmentdelim: rawOptions["segmentdelim"] ?? DEFAULT_SEGMENT_DELIMETER,
      elementdelim: rawOptions["elementdelim"] ?? DEFAULT_ELEMENT_DELIMETER,
    };
  }

  static parse(serialized: string, rawOptions: RawOptions = DEFAULT_OPTIONS): TextDocument {
    const validatedOptions = TextDocument.validateOptions(rawOptions);

    const lines = serialized
      .split(validatedOptions.segmentdelim)
      .map((line) => line.trim())
      .filter(Boolean);

    const content: Content = lines.reduce((content, line) => {
      const [segment, ...elements] = line
        .split(validatedOptions.elementdelim)
        .map((element) => (element.trim().length ? element : ""));

      if (!segment) {
        return content;
      }

      if (!content[segment]) {
        content[segment] = [];
      }

      content[segment].push(elements);

      return content;
    }, {} as Content);

    return new TextDocument(content, rawOptions);
  }

  override serialize = (): string => {
    const text = this.getSegments().reduce((text, segment) => {
      const elements = this.getElements(segment);

      if (!elements.length) {
        text += `${segment}${this.segmentdelim}\n`;
      }

      elements.forEach((section) => {
        const line = [segment, ...section].join(this.elementDelimiter);
        text += `${line}${this.segmentdelim}\n`;
      });

      return text;
    }, "");

    return text;
  };
}
