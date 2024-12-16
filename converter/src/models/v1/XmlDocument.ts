import z from "zod";
import convert from "xml-js";

import Document, { Content, RawOptions } from "./Document";
import { ValidationError } from "../../errors";

const KEY_VALIDATION_PARAMS = { errorMap: () => ({ message: "Key must not be empty" }) };

export const XmlSchema = z.record(
  z.string(KEY_VALIDATION_PARAMS).min(1),
  z.preprocess(
    (val) => new Array(val).flat(),
    z.array(z.record(z.string(KEY_VALIDATION_PARAMS).min(1), z.object({ _text: z.string().optional() }).strict())),
  ),
);

export type Xml = z.infer<typeof XmlSchema>;
export type XmlSection = Xml[number][number];

export default class XmlDocument extends Document {
  static readonly mediaType = "application/xml";

  static fromDocument(document: Document, rawOptions?: RawOptions): XmlDocument {
    return new XmlDocument(document.getContent(), rawOptions);
  }

  static validateOptions(rawOptions: RawOptions): RawOptions {
    return rawOptions;
  }

  static parse(serialized: string, rawOptions: RawOptions = {}): XmlDocument {
    try {
      const xml: Xml = XmlSchema.parse(JSON.parse(convert.xml2json(serialized, { compact: true })).root);

      const content: Content = Object.fromEntries(
        Object.keys(xml).map((segment) => {
          const sections = new Array(xml[segment] ?? []).flat();
          const elements = sections.map((section) =>
            Object.entries(section)
              .sort(([aKey], [bKey]) => {
                try {
                  const aKeySequence = Number(aKey.substring(aKey.indexOf(segment) + segment.length));
                  const bKeySequence = Number(bKey.substring(bKey.indexOf(segment) + segment.length));
                  return aKeySequence - bKeySequence;
                } catch (error) {
                  throw new ValidationError(`Invalid key sequence: ${JSON.stringify({ segment })}`);
                }
              })
              .map(([key, value], index) => {
                const keyIndex = key.indexOf(segment);

                if (keyIndex < 0) {
                  throw new ValidationError(`Key name inconsisent with segment: ${JSON.stringify({ segment, key })}`);
                }

                const keySequence = key.substring(keyIndex + segment.length);

                if (keySequence !== (index + 1).toString()) {
                  throw new ValidationError(`Key name has invalid index: ${JSON.stringify({ key })}`);
                }

                return value._text ?? "";
              }),
          );
          return [segment, elements];
        }),
      );

      return new XmlDocument(content, rawOptions);
    } catch (error) {
      throw new ValidationError(error instanceof ValidationError ? error.message : "Invalid XML");
    }
  }

  override serialize = (): string => {
    const xml = this.getSegments().reduce((xml, segment) => {
      xml[segment] = [];

      this.getElements(segment).forEach((elements) => {
        const section: XmlSection = {};

        elements.forEach((element, index) => {
          section[`${segment}${index + 1}`] = { _text: element };
        });

        xml[segment]?.push(section);
      });

      return xml;
    }, {} as Xml);

    return convert.json2xml(
      JSON.stringify({
        _declaration: {
          _attributes: { version: "1.0", encoding: "UTF-8" },
        },
        root: xml,
      }),
      { compact: true },
    );
  };
}
