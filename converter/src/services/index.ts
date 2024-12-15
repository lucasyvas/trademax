import DocumentsServiceV1 from "./v1/DocumentsService";

export const v1 = () => ({
  documents: new DocumentsServiceV1(),
});

export type ServicesV1 = ReturnType<typeof v1>;
