import { MediaTypeKind, parsers, builders } from "../../models/v1";
import { RawOptions } from "../../models/v1/Document";

export type ConversionOptions = { type: MediaTypeKind; rawOptions: RawOptions };

export default class DocumentsService {
  convert = (serialized: string, from: ConversionOptions, to: ConversionOptions): string => {
    const document = parsers[from.type](serialized, from.rawOptions);
    return builders[to.type](document, to.rawOptions).serialize();
  };
}
