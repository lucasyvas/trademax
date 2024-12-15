import z from "zod";

const KEY_VALIDATION_PARAMS = { errorMap: () => ({ message: "Key must not be empty" }) };

export const StructuredSchema = z.record(
  z.string(KEY_VALIDATION_PARAMS).min(1),
  z.array(z.record(z.string(KEY_VALIDATION_PARAMS).min(1), z.string())),
);

export type StructuredContent = z.infer<typeof StructuredSchema>;
export type StructuredContentEntry = StructuredContent[number][number];
