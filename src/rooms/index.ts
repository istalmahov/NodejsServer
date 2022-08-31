import { FastifyPluginAsync } from "fastify";
import fastifyMultipart from "fastify-multipart";
import { Logger } from "pino";
import { Server } from "socket.io";
import { Config } from "../plugins/config";

import { createRoomRoute } from "./controllers/create-room";
import { getRoom } from "./controllers/get-room";
import { getRoundSong } from "./controllers/get-round-song";
import { getRoundTime } from "./controllers/get-round-time";
import { joinRoom } from "./controllers/join-room";
import { removePlayerRoute } from "./controllers/remove-player";
import { sendRoundSong } from "./controllers/send-round-song";
import { startGame } from "./controllers/start-game";
import { updateRoomRoute } from "./controllers/update-room";

export const ROOMS_ROUTE_PREFIX = "/rooms";

export const roomRoutes =
  (config: Config, logger: Logger, io: Server): FastifyPluginAsync =>
  async (app) => {
    app
      .decorateRequest("room", "")
      .decorateRequest("player", "")
      .register(fastifyMultipart)
      .route(createRoomRoute(config, logger.child({ name: "create-room" })))
      .route(updateRoomRoute(config, logger.child({ name: "update-room" }), io))
      .route(getRoom(config, logger.child({ name: "get-room" })))
      .route(getRoundSong(config, logger.child({ name: "get-round-song" }), io))
      .route(getRoundTime(config, logger.child({ name: "get-round-time" }), io))
      .route(joinRoom(config, io))
      .route(
        removePlayerRoute(config, logger.child({ name: "remove-player" }), io)
      )
      .route(startGame(config, logger, io))
      .route(sendRoundSong(config, logger, io));
  };
