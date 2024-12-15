import JsonDocument from "./JsonDocument";
import TextDocument from "./TextDocument";
import XmlDocument from "./XmlDocument";

export const MediaType = {
  Json: JsonDocument.mediaType,
  Text: TextDocument.mediaType,
  Xml: XmlDocument.mediaType,
} as const;

export const optionsValidators = {
  [MediaType.Json]: JsonDocument.validateOptions,
  [MediaType.Text]: TextDocument.validateOptions,
  [MediaType.Xml]: XmlDocument.validateOptions,
};

export const parsers = {
  [MediaType.Json]: JsonDocument.parse,
  [MediaType.Text]: TextDocument.parse,
  [MediaType.Xml]: XmlDocument.parse,
};

export const builders = {
  [MediaType.Json]: JsonDocument.fromDocument,
  [MediaType.Text]: TextDocument.fromDocument,
  [MediaType.Xml]: XmlDocument.fromDocument,
};

export type MediaTypeKind = (typeof MediaType)[keyof typeof MediaType];
export const mediaTypes = new Set(Object.values(MediaType));
