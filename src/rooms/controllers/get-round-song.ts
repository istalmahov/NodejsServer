import { RawServerBase, RouteOptions } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "pino";
import { Config } from "../../plugins/config";
import { SocketServer } from "../../socket/Socket";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import { getRoomGuardData, roomGuard } from "../../utils/roomGuard";
import { authorizationHeaderSchema } from "../rooms.schemas";
import { getPreviousSong } from "../rooms.service";

export const getRoundSong = (
  config: Config,
  logger: Logger,
  io: SocketServer
): RouteOptions<
  RawServerBase,
  IncomingMessage,
  ServerResponse,
  {
    Params: { code: string; name: string };
  }
> => ({
  method: "GET",
  url: "/song",
  schema: {
    description: "Get a round song",
    tags: ["game"],
    headers: authorizationHeaderSchema,
  },
  preHandler: roomGuard(config, logger),
  handler: async (req) => {
    const { player, room } = getRoomGuardData(req);

    if (!room.isStarted) throw new BadRequestError("Game is not started");
    if (room.currentRound <= 0) return { url: "FIRST_ROUND" };

    const previousSong = getPreviousSong(room, player);

    if (!previousSong) {
      logger.error({
        room,
        round: room.currentRound,
        player: player,
      });
      throw new NotFoundError("Previous song is not found");
    }

    return { url: previousSong };
  },
});
