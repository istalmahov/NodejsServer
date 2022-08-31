import { RawServerBase, RouteOptions } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "pino";
import { Room } from "../../models/room";
import { Config } from "../../plugins/config";
import { SocketServer } from "../../socket/Socket";
import { BadRequestError } from "../../utils/errors";
import { initializeRounds } from "../../utils/getRoundsMap";
import { ownerGuard } from "../../utils/ownerGuard";
import { getRoomGuardData, roomGuard } from "../../utils/roomGuard";
import { startRound } from "../game.service";
import { authorizationHeaderSchema } from "../rooms.schemas";

export const startGame = (
  config: Config,
  logger: Logger,
  io: SocketServer
): RouteOptions<RawServerBase, IncomingMessage, ServerResponse> => ({
  method: "GET",
  url: "/start",
  schema: {
    description: "Start a game",
    tags: ["game"],
    headers: authorizationHeaderSchema,
  },
  preHandler: [roomGuard(config, logger), ownerGuard],
  handler: async (req, res) => {
    const { room } = getRoomGuardData(req);

    if (room.isStarted) throw new BadRequestError("Game is already started");

    const playersNames = room.players.map((p) => p.name);

    const { rounds, songs } = initializeRounds(playersNames);

    await Room.updateOne(
      { code: room.code },
      { $set: { isStarted: true, rounds, songs } }
    );

    await startRound(room, io, logger);

    return { message: "Started" };
  },
});
