import path from "path";
import convert from "xml-js";
import { readFileSync } from "fs";

import { Content } from "./Document";
import XmlDocument from "./XmlDocument";
import { ValidationError } from "../../errors";

import content from "./fixtures/example.canonical.json";

const serializedFixture = readFileSync(path.resolve(__dirname, "./fixtures/example.xml")).toString();

describe("XmlDocument", () => {
  ([{}, content] as Content[]).map((content) =>
    it(`Instantiates a XmlDocument when valid - ${JSON.stringify(content)}`, () => {
      expect(() => new XmlDocument(content)).not.toThrow(ValidationError);
    }),
  );

  it("Returns a XmlDocument when successfully parsed from serialized format", () => {
    expect(() => XmlDocument.parse(serializedFixture)).not.toThrow(ValidationError);
  });

  it("Fails to return a XmlDocument when parse failure from serialized format", async () => {
    expect(() => XmlDocument.parse(JSON.stringify(content))).toThrow(ValidationError);
  });

  it("Serializes a XmlDocument to the expected format", async () => {
    const expected = convert.json2xml(JSON.parse(convert.xml2json(serializedFixture, { compact: true })), {
      compact: true,
    });

    const actual = XmlDocument.parse(serializedFixture).serialize();

    expect(actual).toEqual(expected);
  });
});
