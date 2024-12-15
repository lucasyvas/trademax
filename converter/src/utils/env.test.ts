import { parse as parseEnv } from "./env";

describe("env", () => {
  beforeEach(() => {
    process.env = {};
  });

  it("Successfully loads environment", () => {
    process.env = {
      NODE_ENV: "development",
      NODE_OPTIONS: "--max-old-space-size=768",
      CONVERTER_FEATURE_SWAGGER: "false",
      CONVERTER_PORT: "3000",
    };

    expect(parseEnv).not.toThrow();
  });

  it("Fails to load environment (empty)", () => {
    expect(parseEnv).toThrow();
  });

  it("Fails to load environment (invalid)", () => {
    process.env = {
      NODE_ENV: "",
      NODE_OPTIONS: ".",
      CONVERTER_FEATURE_SWAGGER: "",
      CONVERTER_PORT: "",
    };

    expect(parseEnv).toThrow();
  });
});
