import path from "path";
import { readFileSync } from "fs";

import { Content, RawOptions } from "./Document";
import TextDocument from "./TextDocument";
import { ValidationError } from "../../errors";

import content from "./fixtures/example.canonical.json";

const serializedExampleFixture = readFileSync(path.resolve(__dirname, "./fixtures/example.txt")).toString();
const serializedOrderfulFixture = readFileSync(path.resolve(__dirname, "./fixtures/orderful.txt")).toString();

const TEST_RAW_OPTIONS = {
  segmentdelim: "~",
  elementdelim: "*",
};

describe("TextDocument", () => {
  (
    [
      [{}, TEST_RAW_OPTIONS],
      [content, TEST_RAW_OPTIONS],
    ] as [Content, RawOptions][]
  ).map((args) =>
    it(`Instantiates a TextDocument when valid - ${JSON.stringify(args)}`, () => {
      expect(() => new TextDocument(...args)).not.toThrow(ValidationError);
    }),
  );

  [serializedExampleFixture, serializedOrderfulFixture].map((serializedFixture, index) =>
    it(`Returns a TextDocument when successfully parsed from serialized format - ${index}`, () => {
      expect(() => TextDocument.parse(serializedFixture, TEST_RAW_OPTIONS)).not.toThrow(ValidationError);
    }),
  );
});
