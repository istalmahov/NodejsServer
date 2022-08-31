import { RouteOptions, RawServerBase } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "pino";
import { Room } from "../../models/room";
import { Config } from "../../plugins/config";
import { SocketServer } from "../../socket/Socket";
import { ForbiddenError, NotFoundError } from "../../utils/errors";
import { joiValidator } from "../../utils/joiValidator";
import { getRoomGuardData, roomGuard } from "../../utils/roomGuard";
import {
  authorizationHeaderSchema,
  removePlayerParamsSchema,
} from "../rooms.schemas";
import { deleteRoom, removePlayer, updatePlayer } from "../rooms.service";

export const removePlayerRoute = (
  config: Config,
  logger: Logger,
  io: SocketServer
): RouteOptions<
  RawServerBase,
  IncomingMessage,
  ServerResponse,
  {
    Params: { name: string };
  }
> => ({
  method: "DELETE",
  url: "/players/:name",
  schema: {
    description: "Remove a player from room",
    tags: ["room"],
    params: removePlayerParamsSchema,
    headers: authorizationHeaderSchema,
  },
  preHandler: roomGuard(config, logger),
  handler: async (req, res) => {
    const { room, player } = getRoomGuardData(req);

    if (!player.isOwner && player.name !== req.params.name) {
      throw new ForbiddenError("You can't remove this player");
    }

    const deletedPlayer = await removePlayer(room, req.params);

    if (!deletedPlayer) throw new NotFoundError("Player not found");

    io.to(room.code!).emit("player-disconnected", {
      name: req.params.name,
    });

    if (room.players.length === 0) {
      await deleteRoom({ code: room.code });
      return res.status(204).send();
    }

    if (deletedPlayer.isOwner) {
      const updatedOwner = { name: room.players[0].name, isOwner: true };
      await updatePlayer(room, updatedOwner);
      io.to(room.code!).emit("player-updated", updatedOwner);
    }

    res.status(204).send();
  },
});
