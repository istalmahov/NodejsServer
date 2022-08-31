import { RawServerBase, RouteOptions } from "fastify";
import { MultipartFile } from "fastify-multipart";
import { createWriteStream } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { Logger } from "pino";
import { pipeline } from "stream";
import { promisify } from "util";
import { Room } from "../../models/room";
import { Config } from "../../plugins/config";
import { SocketServer } from "../../socket/Socket";
import { BadRequestError } from "../../utils/errors";
import { getRoomGuardData, roomGuard } from "../../utils/roomGuard";
import { canEndRound, endRound, getTimer } from "../game.service";
import {
  authorizationHeaderSchema,
  sendSongHeadersSchema,
} from "../rooms.schemas";
import { updateSongStatus } from "../rooms.service";

const pump = promisify(pipeline);

export const sendRoundSong = (
  config: Config,
  logger: Logger,
  io: SocketServer
): RouteOptions<RawServerBase, IncomingMessage, ServerResponse> => ({
  method: "POST",
  url: "/song",
  schema: {
    description: "Send a round song",
    tags: ["game"],
    headers: sendSongHeadersSchema,
  },
  preHandler: roomGuard(config, logger),
  handler: async (req, res) => {
    const { room, player } = getRoomGuardData(req);

    if (room.isEnded) throw new BadRequestError("Game already ended");

    const round = room.rounds[room.currentRound];

    const initialSongAuthor = round.find(
      (round) => round.player === player.name
    )?.song;

    if (room.currentRound > 0) {
      if (!initialSongAuthor) {
        logger.error("Initial song author not found!");
        throw new Error("Unexprected error");
      }

      if (
        room.songs
          .get(initialSongAuthor)!
          .find((song) => song.player === player.name)
      )
        throw new BadRequestError("You already sent a song");
    }

    const data: MultipartFile = await (req as any).file();

    const filepath = `${room.code}-round-${room.currentRound}-${
      player.name
    }${path.extname(data.filename)}`;

    await pump(
      data.file,
      createWriteStream(path.resolve(`./uploads/${filepath}`))
    );

    await Room.updateOne(
      { code: room.code },
      {
        $push: {
          [`songs.${initialSongAuthor || player.name}`]: {
            player: player.name,
            url: `/uploads/${filepath}`,
          },
        },
      }
    );

    await updateSongStatus(room, player, true);

    io.to(room.code!).emit("player-ready", { name: player.name });

    const updatedRoom = await Room.findOne({ code: room.code });

    if (canEndRound(updatedRoom!) && getTimer(room.code!) < room.roundTime) {
      logger.debug(`All songs sent before round timeout! Ending now...`);
      io.to(room.code!).emit("round-ended");
      await endRound(room, io, logger);
    }

    return { message: "Sent!" };
  },
});
