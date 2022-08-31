import { RawServerBase, RouteOptions } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Room } from "../../models/room";
import { Config } from "../../plugins/config";
import { SocketServer } from "../../socket/Socket";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import { parseMultipart } from "../../utils/parseMultipart";
import { joinRoomBodySchema, roomCodeParamsSchema } from "../rooms.schemas";
import { addPlayer, tokenResponse } from "../rooms.service";

export const joinRoom = (
  config: Config,
  io: SocketServer
): RouteOptions<
  RawServerBase,
  IncomingMessage,
  ServerResponse,
  {
    Body: { name: string; isOwner: boolean; avatar: string };
    Params: { code: string };
  }
> => ({
  method: "POST",
  url: "/:code/join",
  schema: {
    description: "Join a room",
    tags: ["room"],
    body: joinRoomBodySchema,
    params: roomCodeParamsSchema,
  },
  preValidation: [parseMultipart],
  handler: async (req) => {
    const room = await Room.findOne({ code: req.params.code });

    if (!room) throw new NotFoundError("Room not found");
    if (room.isStarted) throw new BadRequestError("Game is started");
    if (room.players.length >= room.maximumPlayers)
      throw new BadRequestError("Room is full");

    if (room.players.length === 0) req.body.isOwner = true;

    const { modifiedCount } = await addPlayer(req.params.code, req.body);

    if (!modifiedCount)
      throw new BadRequestError(`Name ${req.body.name} is already used`);

    io.to(room.code!).emit("player-connected", req.body);

    return tokenResponse(config, room.code!, req.body.name);
  },
});
