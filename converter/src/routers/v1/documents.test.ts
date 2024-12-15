import path from "path";
import { readFileSync } from "fs";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

import { v1 as createServicesV1 } from "../../services";
import { ConversionOptions } from "../../services/v1/DocumentsService";
import createDocumentsRouter from "./documents";

import { RawOptions } from "../../models/v1/Document";

import { MediaType, MediaTypeKind, mediaTypes } from "../../models/v1";
import { serializeMediaTypeOptions } from "./utils/documents";

const jsonFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/example.json")).toString();
const textFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/example.txt")).toString();
const xmlFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/example.xml")).toString();

const orderfulJsonFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/orderful.json")).toString();
const orderfulTextFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/orderful.txt")).toString();
const orderfulXmlFixture = readFileSync(path.resolve(__dirname, "../../models/v1/fixtures/orderful.xml")).toString();

const services = createServicesV1();

const createApp = (): express.Express => {
  const app = express();

  app.use(bodyParser.text({ type: "*/*" }));
  app.use("/", createDocumentsRouter({ services }));

  return app;
};

type MatrixTestCaseInput = {
  [type in MediaTypeKind]: {
    fixture: string;
    rawOptions: RawOptions;
  };
};

type MatrixTestCases = [string, ConversionOptions, ConversionOptions][];

const buildMatrixTestCases = (input: MatrixTestCaseInput): MatrixTestCases => {
  const testCases: MatrixTestCases = [];

  mediaTypes.forEach((sourceMediaType) => {
    mediaTypes.forEach((targetMediaType) => {
      const inputFixture = input[sourceMediaType].fixture;
      const fromOptions = { type: sourceMediaType, rawOptions: input[sourceMediaType].rawOptions };
      const toOptions = { type: targetMediaType, rawOptions: input[targetMediaType].rawOptions };

      testCases.push([inputFixture, fromOptions, toOptions]);
    });
  });

  return testCases;
};

const buildExampleMatrixTestCases = () => {
  return buildMatrixTestCases({
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
  });
};

const buildOrderfulMatrixTestCases = () => {
  return buildMatrixTestCases({
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
  });
};

describe("documents", () => {
  buildExampleMatrixTestCases().map((args) => {
    const [fixture, from, to] = args;

    const contentTypeHeaderEntries = [from.type, "charset=utf-8"];
    const acceptHeaderEntries = [to.type, "charset=utf-8"];
    const contentTypeDirectives = serializeMediaTypeOptions(from.rawOptions);
    const acceptDirectives = serializeMediaTypeOptions(to.rawOptions);

    if (contentTypeDirectives) {
      contentTypeHeaderEntries.push(`directives=${contentTypeDirectives}`);
    }

    if (acceptDirectives) {
      acceptHeaderEntries.push(`directives=${acceptDirectives}`);
    }

    const contentTypeHeader = contentTypeHeaderEntries.sort().join("; ");
    const acceptHeader = acceptHeaderEntries.sort().join("; ");

    return it(`Converts example documents from source to target type - ${JSON.stringify([from, to])}`, async () => {
      const response = await request(createApp())
        .post("/")
        .set("Content-Type", contentTypeHeader)
        .set("Accept", acceptHeader)
        .send(fixture)
        .buffer(true)
        .parse((res, cb) => {
          let data = Buffer.from("");

          res.on("data", (chunk) => {
            data = Buffer.concat([data, chunk]);
          });

          res.on("end", () => {
            cb(null, data.toString());
          });
        });

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toEqual(acceptHeader);

      const document = services.documents.convert(fixture, from, to);
      expect(response.body).toEqual(document);
    });
  });

  buildOrderfulMatrixTestCases().map((args) => {
    const [fixture, from, to] = args;

    const contentTypeHeaderEntries = [from.type, "charset=utf-8"];
    const acceptHeaderEntries = [to.type, "charset=utf-8"];
    const contentTypeDirectives = serializeMediaTypeOptions(from.rawOptions);
    const acceptDirectives = serializeMediaTypeOptions(to.rawOptions);

    if (contentTypeDirectives) {
      contentTypeHeaderEntries.push(`directives=${contentTypeDirectives}`);
    }

    if (acceptDirectives) {
      acceptHeaderEntries.push(`directives=${acceptDirectives}`);
    }

    const contentTypeHeader = contentTypeHeaderEntries.sort().join("; ");
    const acceptHeader = acceptHeaderEntries.sort().join("; ");

    return it(`Converts Orderful test documents from source to target type - ${JSON.stringify([from, to])}`, async () => {
      const response = await request(createApp())
        .post("/")
        .set("Content-Type", contentTypeHeader)
        .set("Accept", acceptHeader)
        .send(fixture)
        .buffer(true)
        .parse((res, cb) => {
          let data = Buffer.from("");

          res.on("data", (chunk) => {
            data = Buffer.concat([data, chunk]);
          });

          res.on("end", () => {
            cb(null, data.toString());
          });
        });

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toEqual(acceptHeader);

      const document = services.documents.convert(fixture, from, to);
      expect(response.body).toEqual(document);
    });
  });

  it("Fails to convert when invalid parameters - unsupported content type", async () => {
    const response = await request(createApp())
      .post("/")
      .set("Content-Type", "application/text")
      .set("Accept", MediaType.Json)
      .send("hello");

    expect(response.status).toBe(400);
    expect(response.header["x-trademax-error"]).toBeDefined();
  });

  it("Fails to convert when invalid parameters - unsupported accept type", async () => {
    const response = await request(createApp())
      .post("/")
      .set("Content-Type", MediaType.Json)
      .set("Accept", "application/text")
      .send({});

    expect(response.status).toBe(400);
    expect(response.header["x-trademax-error"]).toBeDefined();
  });

  it("Fails to convert when invalid parameters - bad body", async () => {
    const response = await request(createApp())
      .post("/")
      .set("Content-Type", MediaType.Json)
      .set("Accept", MediaType.Json)
      .send({ a: {} });

    expect(response.status).toBe(400);
    expect(response.header["x-trademax-error"]).toBeDefined();
  });
});
