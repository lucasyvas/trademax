import type { JestConfigWithTsJest } from "ts-jest";

process.env["NODE_ENV"] = "test";

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  collectCoverage: false,
  coverageReporters: ["text", "lcov"],
};

export default config;
