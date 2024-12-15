import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import swagger from "swagger-ui-express";
import fs from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import * as services from "./services";
import * as routers from "./routers";

import { NoContentResponse } from "./responses";

export type CreateProps = {
  enableSwagger?: boolean;
};

const create = async ({ enableSwagger = false }: CreateProps): Promise<express.Express> => {
  const app = express();

  app.use(helmet());

  app.get("/health", (_, res) => {
    res.status(new NoContentResponse().status).send();
  });

  if (enableSwagger) {
    const file = await fs.readFile(path.resolve(__dirname, "../docs/openapi.yml"), "utf-8");
    const spec = yaml.load(file) as swagger.JsonObject;

    app.use("/api/docs", swagger.serve, swagger.setup(spec));

    app.get(/^\/(?:api\/?)?$/, (_, res) => {
      res.redirect("/api/docs");
    });
  }

  app.use(bodyParser.text({ type: "*/*" }));
  app.use("/api/v1", routers.v1({ services: services.v1() }));

  return app;
};

export default create;
