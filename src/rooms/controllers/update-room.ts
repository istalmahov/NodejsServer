import { RawServerBase, RouteOptions } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "pino";
import { RoomDoc } from "../../models/room";
import { Config } from "../../plugins/config";
import { SocketServer } from "../../socket/Socket";
import { ownerGuard } from "../../utils/ownerGuard";
import { getRoomGuardData, roomGuard } from "../../utils/roomGuard";
import { authorizationHeaderSchema, updateRoomSchema } from "../rooms.schemas";
import { updateRoom } from "../rooms.service";

export const updateRoomRoute = (
  config: Config,
  logger: Logger,
  io: SocketServer
): RouteOptions<
  RawServerBase,
  IncomingMessage,
  ServerResponse,
  { Body: Pick<RoomDoc, "maximumPlayers" | "roundTime"> }
> => ({
  method: "PUT",
  url: "/",
  schema: {
    description: "Update a room",
    tags: ["room"],
    headers: authorizationHeaderSchema,
    body: updateRoomSchema,
  },
  preHandler: [roomGuard(config, logger), ownerGuard],
  handler: async (request, reply) => {
    const { room } = getRoomGuardData(request);

    logger.debug(request.body, "Update data");

    await updateRoom({ code: room.code }, request.body);

    io.to(room.code).emit("room-updated", { code: room.code, ...request.body });

    return room;
  },
});
