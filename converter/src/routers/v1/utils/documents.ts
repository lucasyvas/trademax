import express from "express";

import { MediaTypeKind, mediaTypes, optionsValidators } from "../../../models/v1";
import { RawOptions } from "../../../models/v1/Document";

import { ValidationError } from "../../../errors";

export const validateHeaders = (req: express.Request) => {
  return { from: validateMediaTypeHeader(req, "content-type"), to: validateMediaTypeHeader(req, "accept") };
};

export const validateMediaTypeHeader = (req: express.Request, headerKey: string) => {
  const header = req.headers[headerKey] as string | undefined;
  const [headerMediaType, ...headerMediaTypeOptions] = header?.split(";").map((entry) => entry.trim()) ?? [];

  const mediaType = validateMediaType(headerMediaType);
  const options = validateMediaTypeOptions(mediaType, headerMediaTypeOptions);

  return {
    type: mediaType,
    rawOptions: optionsValidators[mediaType as MediaTypeKind](options),
  };
};

export const validateBody = (req: express.Request): string => {
  if (!req.body) {
    throw new ValidationError("Body cannot be empty");
  }

  return req.body;
};

export const serializeMediaTypeOptions = (rawOptions: RawOptions): string =>
  Buffer.from(
    Object.entries(rawOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join(","),
  ).toString("base64url");

const validateMediaType = (mediaType: string | undefined): MediaTypeKind => {
  const error = new ValidationError("Unsupported media type");

  if (!mediaType) {
    throw error;
  }

  if (!mediaTypes.has(mediaType as MediaTypeKind)) {
    throw error;
  }

  return mediaType as MediaTypeKind;
};

const validateMediaTypeOptions = (mediaType: MediaTypeKind, options: string[]): RawOptions => {
  const rawOptions = deserializeMediaTypeOptionsFromHeaderFormat(options);
  return optionsValidators[mediaType](rawOptions);
};

const deserializeMediaTypeOptionsFromHeaderFormat = (options: string[]): RawOptions => {
  const parsedOptions = options.reduce(
    (opts, entry) => {
      const [key, value] = entry.split("=", 2).map((value) => value.trim());
      key && (opts[key] = value ?? "");
      return opts;
    },
    {} as { [option: string]: string },
  );

  const directives = parsedOptions["directives"];

  if (!directives) {
    return {};
  }

  const rawOptions = Object.fromEntries(
    Buffer.from(directives ?? "", "base64url")
      .toString()
      .split(",", 2)
      .map((pair) => pair.split("=", 2)),
  );

  return rawOptions;
};
