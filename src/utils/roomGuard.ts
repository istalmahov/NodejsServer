import { preHandlerAsyncHookHandler } from "fastify";
import jwt from "jsonwebtoken";
import { Logger } from "pino";
import { PlayerDoc } from "../models/player";
import { Room, RoomDoc } from "../models/room";
import { Config } from "../plugins/config";
import { NotAuthorizedError, NotFoundError } from "./errors";

export const roomGuard =
  (config: Config, logger: Logger): preHandlerAsyncHookHandler =>
  async (req) => {
    const token = req.headers.authorization;

    if (!token) throw new NotAuthorizedError("Not authorized");

    try {
      const { room: roomCode, player } = jwt.verify(
        token,
        config.JWT_SECRET
      ) as { room: string; player: string };

      const room = await Room.findOne({
        code: roomCode,
        "players.name": { $eq: player },
      });

      if (!room) throw new NotFoundError("Room not found");

      (req as any).room = room;
      (req as any).player = room.players.find((p) => p.name === player);
    } catch (err) {
      throw new NotAuthorizedError("Error while processing token");
    }
  };

export const getRoomGuardData = (
  req: any
): { room: RoomDoc; player: PlayerDoc } => ({
  room: req.room,
  player: req.player,
});
