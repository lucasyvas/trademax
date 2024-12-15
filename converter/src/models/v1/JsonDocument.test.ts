import { Content } from "./Document";
import JsonDocument from "./JsonDocument";

import { ValidationError } from "../../errors";

import fixture from "./fixtures/example.json";
import content from "./fixtures/example.canonical.json";

describe("JsonDocument", () => {
  ([{}, content] as Content[]).map((content) =>
    it(`Instantiates a JsonDocument when valid - ${JSON.stringify(content)}`, () => {
      expect(() => new JsonDocument(content)).not.toThrow(ValidationError);
    }),
  );

  it("Returns a JsonDocument when successfully parsed from serialized format", () => {
    expect(() => JsonDocument.parse(JSON.stringify(fixture))).not.toThrow();
  });

  it("Fails to return a JsonDocument when parse failure from serialized format", () => {
    expect(() => JsonDocument.parse("")).toThrow(ValidationError);
  });

  it("Serializes a JsonDocument to the expected format", () => {
    const expected = JSON.stringify(fixture, null, 2);
    const actual = JsonDocument.parse(expected).serialize();
    expect(actual).toEqual(expected);
  });
});
