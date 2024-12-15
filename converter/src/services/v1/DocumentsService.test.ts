import path from "path";
import { readFileSync } from "fs";

import DocumentsService, { ConversionOptions } from "./DocumentsService";

import JsonDocument from "../../models/v1/JsonDocument";
import TextDocument from "../../models/v1/TextDocument";
import XmlDocument from "../../models/v1/XmlDocument";

import Document, { RawOptions } from "../../models/v1/Document";
import { MediaType, MediaTypeKind, mediaTypes } from "../../models/v1";

const jsonFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/example.json")).toString();
const textFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/example.txt")).toString();
const xmlFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/example.xml")).toString();

const orderfulJsonFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/orderful.json")).toString();
const orderfulTextFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/orderful.txt")).toString();
const orderfulXmlFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/orderful.xml")).toString();

const documents = new DocumentsService();

type MatrixTestCaseInput = {
  [type in MediaTypeKind]: {
    fixture: string;
    rawOptions: RawOptions;
  };
};

type MatrixTestCaseOutput = {
  [type in MediaTypeKind]: {
    fixture: string;
    parse: (serialized: string, rawOptions?: RawOptions) => Document;
    rawOptions: RawOptions;
  };
};

type MatrixTestCases = [[string, ConversionOptions, ConversionOptions], string][];

const buildMatrixTestCases = (input: MatrixTestCaseInput, output: MatrixTestCaseOutput): MatrixTestCases => {
  const testCases: MatrixTestCases = [];

  mediaTypes.forEach((sourceMediaType) => {
    mediaTypes.forEach((targetMediaType) => {
      const inputFixture = input[sourceMediaType].fixture;
      const fromOptions = { type: sourceMediaType, rawOptions: input[sourceMediaType].rawOptions };
      const toOptions = { type: targetMediaType, rawOptions: input[targetMediaType].rawOptions };

      const outputFixture = output[targetMediaType].fixture;
      const outputOptions = output[targetMediaType].rawOptions;
      const expected = output[targetMediaType].parse(outputFixture, outputOptions).serialize();

      testCases.push([[inputFixture, fromOptions, toOptions], expected]);
    });
  });

  return testCases;
};

const buildExampleMatrixTestCases = () => {
  return buildMatrixTestCases(
    {
      [MediaType.Json]: {
        fixture: jsonFixture,
        rawOptions: {},
      },
      [MediaType.Text]: {
        fixture: textFixture,
        rawOptions: { segmentdelim: "~", elementdelim: "*" },
      },
      [MediaType.Xml]: {
        fixture: xmlFixture,
        rawOptions: {},
      },
    },
    {
      [MediaType.Json]: {
        fixture: jsonFixture,
        parse: JsonDocument.parse,
        rawOptions: {},
      },
      [MediaType.Text]: {
        fixture: textFixture,
        parse: TextDocument.parse,
        rawOptions: { segmentdelim: "~", elementdelim: "*" },
      },
      [MediaType.Xml]: {
        fixture: xmlFixture,
        parse: XmlDocument.parse,
        rawOptions: {},
      },
    },
  );
};

const buildOrderfulMatrixTestCases = () => {
  return buildMatrixTestCases(
    {
      [MediaType.Json]: {
        fixture: orderfulJsonFixture,
        rawOptions: {},
      },
      [MediaType.Text]: {
        fixture: orderfulTextFixture,
        rawOptions: { segmentdelim: "~", elementdelim: "*" },
      },
      [MediaType.Xml]: {
        fixture: orderfulXmlFixture,
        rawOptions: {},
      },
    },
    {
      [MediaType.Json]: {
        fixture: orderfulJsonFixture,
        parse: JsonDocument.parse,
        rawOptions: {},
      },
      [MediaType.Text]: {
        fixture: orderfulTextFixture,
        parse: TextDocument.parse,
        rawOptions: { segmentdelim: "~", elementdelim: "*" },
      },
      [MediaType.Xml]: {
        fixture: orderfulXmlFixture,
        parse: XmlDocument.parse,
        rawOptions: {},
      },
    },
  );
};

describe("DocumentsService", () => {
  buildExampleMatrixTestCases().map(([args, expected]) => {
    const [fixture, ...restArgs] = args;

    return it(`Converts example documents to the expected formats - ${JSON.stringify(restArgs)}`, async () => {
      const actual = documents.convert(...[fixture, ...restArgs]);
      expect(actual).toEqual(expected);
    });
  });

  buildOrderfulMatrixTestCases().map(([args, expected]) => {
    const [fixture, ...restArgs] = args;

    return it(`Converts Orderful test documents to the expected formats - ${JSON.stringify(restArgs)}`, async () => {
      const actual = documents.convert(...[fixture, ...restArgs]);
      expect(actual).toEqual(expected);
    });
  });
});
