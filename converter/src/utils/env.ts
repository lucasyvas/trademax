import z from "zod";

const NODE_ENVS = ["test", "development", "production"] as const;

export const Schema = () =>
  z.object({
    NODE_ENV: z
      .enum(NODE_ENVS, {
        errorMap: () => ({ message: `Must be one of: ${NODE_ENVS.join(", ")}` }),
      })
      .optional()
      .default("development"),

    NODE_OPTIONS: z
      .string({ errorMap: () => ({ message: "Must be space-delimited options" }) })
      .regex(/^(?:--[\S].+)?(?: --[\S].+)*$/)
      .optional()
      .default(""),

    CONVERTER_FEATURE_SWAGGER: z
      .enum(["true", "false"], { errorMap: () => ({ message: "Must be either 'true' or 'false'" }) })
      .transform((boolean) => ({ true: true, false: false })[boolean])
      .optional()
      .default("false"),

    CONVERTER_PORT: z
      .string({ errorMap: () => ({ message: "Must be a number" }) })
      .regex(/\d+/)
      .transform(Number),
  });

const envSchema = Schema();

export const parse = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    const cause = error as z.ZodError;
    const issues = cause.issues.map(({ path, message }) => [path[0], message]);
    const message = `Environment variable issues were found: ${issues.map((issue) => issue.join(" - ")).join(" | ")}`;
    throw new Error(message, { cause });
  }
};
