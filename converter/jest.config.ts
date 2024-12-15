import type { JestConfigWithTsJest } from "ts-jest";

import baseConfig from "../jest.config";

const config: JestConfigWithTsJest = {
  ...baseConfig,
  collectCoverage: true,
  coverageDirectory: __dirname,
};

export default config;
