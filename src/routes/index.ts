import { FastifyPluginAsync } from "fastify";
import { Logger } from "pino";
import { Config } from "../plugins/config";
import { roomRoutes, ROOMS_ROUTE_PREFIX } from "../rooms";
import { sampleRoutes, SAMPLES_ROUTE_PREFIX } from "../samples";
import { SocketServer } from "../socket/Socket";

export const routes =
  (config: Config, logger: Logger, io: SocketServer): FastifyPluginAsync =>
  async (app) => {
    app.register(roomRoutes(config, logger.child({ name: "Rooms" }), io), {
      prefix: ROOMS_ROUTE_PREFIX,
    });

    app.register(sampleRoutes(config, logger.child({ name: "Samples" }), io), {
      prefix: SAMPLES_ROUTE_PREFIX,
    });
  };
