import Document, { Content } from "./Document";
import fixture from "./fixtures/example.canonical.json";

describe("Document", () => {
  ([{}, fixture] as Content[]).map((content) =>
    it(`Instantiates a Document - ${JSON.stringify(content)}`, () => {
      expect(() => new Document(content)).not.toThrow();
    }),
  );

  it("Returns content with getContent", () => {
    const content = new Document(fixture).getContent();
    expect(content).toEqual(fixture);
  });

  it("Returns segments with getSegments", () => {
    const document = new Document(fixture);
    const segments = document.getSegments();
    expect(segments).toEqual(Object.keys(document.getContent()));
  });

  it("Returns segment elements with getElements", () => {
    const document = new Document(fixture);
    const content = document.getContent();
    const segments = document.getSegments();

    segments.forEach((segment) => {
      const elements = document.getElements(segment);
      expect(elements).toEqual(content[segment] ?? []);
    });
  });
});
