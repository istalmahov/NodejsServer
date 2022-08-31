import { RawServerBase, RouteOptions } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "pino";
import { Config } from "../../plugins/config";
import { getRoomGuardData, roomGuard } from "../../utils/roomGuard";
import { authorizationHeaderSchema } from "../rooms.schemas";

export const getRoom = (
  config: Config,
  logger: Logger
): RouteOptions<RawServerBase, IncomingMessage, ServerResponse> => ({
  method: "GET",
  url: "/",
  schema: {
    description: "Get a room",
    tags: ["room"],
    headers: authorizationHeaderSchema,
  },
  preHandler: roomGuard(config, logger),
  handler: async (req) => {
    const { room } = getRoomGuardData(req);

    return room;
  },
});
