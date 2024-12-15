import express, { Router } from "express";

import { ServicesV1 } from "../../services";

import Response from "../../responses/Response";
import { BadRequestResponse, ErrorResponse, InternalServerErrorResponse, OkResponse } from "../../responses";

import { serializeMediaTypeOptions, validateBody, validateHeaders } from "./utils/documents";
import { ValidationError } from "../../errors";

export type Props = {
  services: ServicesV1;
};

const create = (props: Props) => {
  const router = Router();

  router.post("/", (req, res) => {
    let response: Response;
    let options: ReturnType<typeof validateHeaders>["to"] | null = null;

    try {
      const handle = createPostDocumentsHandler(props);
      [options, response] = handle(req);
    } catch (error) {
      if (error instanceof ValidationError) {
        response = new BadRequestResponse(error.message);
      } else {
        console.error(error);
        response = new InternalServerErrorResponse();
      }

      res.setHeader("X-Trademax-Error", response.content as string);
    }

    res.status(response.status);

    if (response instanceof ErrorResponse || options === null) {
      res.send();
    } else {
      const contentTypeHeaderEntries = [options.type, "charset=utf-8"];
      const directives = serializeMediaTypeOptions(options.rawOptions);

      if (directives) {
        contentTypeHeaderEntries.push(`directives=${directives}`);
      }

      const contentTypeHeader = contentTypeHeaderEntries.sort().join("; ");

      res.setHeader("Content-Type", contentTypeHeader);
      res.status(response.status).send(response.content);
    }
  });

  return router;
};

const createPostDocumentsHandler =
  ({ services: { documents } }: Props) =>
  (req: express.Request): [ReturnType<typeof validateHeaders>["to"] | null, Response] => {
    const options = validateHeaders(req);
    const body = validateBody(req);

    const document = documents.convert(body, options.from, options.to);

    return [options.to, new OkResponse(document)];
  };

export default create;
