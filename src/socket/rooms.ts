import jwt from "jsonwebtoken";
import { Logger } from "pino";
import { Room } from "../models/room";
import { Config } from "../plugins/config";
import { SocketServer } from "./Socket";

const onPlayerConnect = (config: Config, io: SocketServer) =>
  io.use((socket, next) => {
    const token: string = socket.handshake.auth.token;

    try {
      const { room, player } = jwt.verify(token, config.JWT_SECRET) as {
        room: string;
        player: string;
      };

      socket.data.room = room;
      socket.data.player = player;

      socket.join(room);

      next();
    } catch (err) {
      if (err) next(new Error("Not authorized"));
    }
  });

const updatePlayerStatus = async (
  io: SocketServer,
  room: string,
  player: string,
  status: boolean
) => {
  await Room.updateOne(
    { code: room, "players.name": player },
    { $set: { "players.$.isOnline": status } }
  );

  io.to(room).emit("player-updated", {
    name: player,
    isOnline: status,
  });
};

export const addSocketHandlers = async (
  config: Config,
  logger: Logger,
  io: SocketServer
) => {
  onPlayerConnect(config, io);

  io.on("connect", async (socket) => {
    logger.debug("PLayer connected!!");

    socket.on("disconnect", async () => {
      logger.debug("-");

      updatePlayerStatus(io, socket.data.room!, socket.data.player!, false);
    });

    updatePlayerStatus(io, socket.data.room!, socket.data.player!, true);
  });
};
