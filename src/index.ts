import pino from "pino";
import buildApp from "./app";
import { loadConfig } from "./plugins/config";
import { loadDatabase } from "./plugins/mongo";

const start = async () => {
  const config = loadConfig();

  const logger = pino({
    level: config.LOG_LEVEL,
    transport: { target: "pino-pretty" },
  });

  await loadDatabase(config, logger);

  const app = await buildApp({
    config,
    logger,
  });

  try {
    await app.ready();
    await app.listen(config.PORT);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
