import { RawServerBase, RouteOptions } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "pino";
import { Config } from "../../plugins/config";
import { SocketServer } from "../../socket/Socket";
import { getRoomGuardData, roomGuard } from "../../utils/roomGuard";
import { getTimer } from "../game.service";
import { authorizationHeaderSchema } from "../rooms.schemas";

export const getRoundTime = (
  config: Config,
  logger: Logger,
  io: SocketServer
): RouteOptions<RawServerBase, IncomingMessage, ServerResponse> => ({
  method: "GET",
  url: "/timer",
  schema: {
    description: "Get a round time",
    tags: ["room"],
    headers: authorizationHeaderSchema,
  },
  preHandler: roomGuard(config, logger),
  handler: async (req) => {
    const { room } = getRoomGuardData(req);
    return { time: getTimer(room.code!) };
  },
});
