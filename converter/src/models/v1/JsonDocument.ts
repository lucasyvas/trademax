import z from "zod";

import Document, { Content, RawOptions } from "./Document";
import { ValidationError } from "../../errors";

const KEY_VALIDATION_PARAMS = { errorMap: () => ({ message: "Key must not be empty" }) };

export const JsonSchema = z.record(
  z.string(KEY_VALIDATION_PARAMS).min(1),
  z.array(z.record(z.string(KEY_VALIDATION_PARAMS).min(1), z.string())),
);

export type Json = z.infer<typeof JsonSchema>;
export type JsonEntry = Json[number][number];

export default class JsonDocument extends Document {
  static readonly mediaType = "application/json";

  static fromDocument(document: Document, options?: RawOptions): JsonDocument {
    return new JsonDocument(document.getContent(), options);
  }

  static validateOptions(rawOptions: RawOptions): RawOptions {
    return rawOptions;
  }

  static parse(serialized: string, rawOptions: RawOptions = {}): JsonDocument {
    try {
      const json = JsonSchema.parse(JSON.parse(serialized));

      const content: Content = Object.fromEntries(
        Object.keys(json).map((segment) => {
          const sections = json[segment] ?? [];
          const elements = sections.map((entry) =>
            Object.entries(entry)
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

                return value;
              }),
          );
          return [segment, elements];
        }),
      );

      return new JsonDocument(content, rawOptions);
    } catch (error) {
      throw new ValidationError(error instanceof ValidationError ? error.message : "Invalid JSON");
    }
  }

  override serialize = (): string => {
    const json = this.getSegments().reduce((json, segment) => {
      json[segment] = [];

      this.getElements(segment).forEach((section) => {
        const entry: JsonEntry = {};

        section.forEach((element, index) => {
          entry[`${segment}${index + 1}`] = element;
        });

        if (Object.keys(entry).length) {
          json[segment]?.push(entry);
        }
      });

      return json;
    }, {} as Json);

    return JSON.stringify(json, null, 2);
  };
}
