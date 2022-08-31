import { RawServerBase, RouteOptions } from "fastify";
import { MultipartFile } from "fastify-multipart";
import { createWriteStream } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import path, { extname } from "path";
import { Logger, P } from "pino";
import shortid from "shortid";
import { pipeline } from "stream";
import { promisify } from "util";
import { Room, RoomDoc } from "../../models/room";
import { Config } from "../../plugins/config";
import { BadRequestError } from "../../utils/errors";
import { parseMultipart } from "../../utils/parseMultipart";
import { createRoomSchema } from "../rooms.schemas";
import { createRoom, tokenResponse } from "../rooms.service";

export const createRoomRoute = (
  config: Config,
  logger: Logger
): RouteOptions<
  RawServerBase,
  IncomingMessage,
  ServerResponse,
  { Body: Partial<RoomDoc> }
> => ({
  method: "POST",
  url: "/",
  schema: {
    description: "Create a room",
    tags: ["room"],
    body: createRoomSchema,
  },
  handler: async (req) => {
    console.log(req.body);

    const room = await createRoom(req.body);

    return room;
  },
});
