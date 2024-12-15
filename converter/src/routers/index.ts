import { Router } from "express";

import createDocumentsRouterV1 from "./v1/documents";
import { ServicesV1 } from "../services";

export type Props = { services: ServicesV1 };

export const v1 = (props: Props) => {
  const router = Router();

  router.use("/documents", createDocumentsRouterV1(props));

  return router;
};
