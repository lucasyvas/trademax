import { parse as parseEnv } from "./utils/env";

import createApp from "./app";

const handleError = async (cause: unknown) => {
  console.error("Encountered an uncaught error. Terminating process...", cause);
  process.exit(1);
};

process.on("uncaughtException", (error) => {
  handleError(error);
});

process.on("unhandledRejection", (error) => {
  handleError(error);
});

const main = async () => {
  const env = parseEnv();
  const app = await createApp({ enableSwagger: env.CONVERTER_FEATURE_SWAGGER });

  const server = app.listen(env.CONVERTER_PORT, () => {
    console.info(`Listening on http://localhost:${env.CONVERTER_PORT}...`);
  });

  const handleTerminate = () => {
    console.info("Shutdown signal received. Exiting...");

    server.close((error) => {
      if (error) {
        handleError(error);
        return;
      }

      process.exit(0);
    });
  };

  process.on("SIGINT", handleTerminate);
  process.on("SIGTERM", handleTerminate);
};

main();
