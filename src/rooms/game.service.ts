import { Logger } from "pino";
import { Room, RoomDoc } from "../models/room";
import { SocketServer } from "../socket/Socket";
import { updateRoom } from "./rooms.service";

export interface ActiveTimer {
  currentTime: number;
  interval: NodeJS.Timer;
  timeout: NodeJS.Timeout;
  uploadStatusInterval?: NodeJS.Timer;
  ended: boolean;
}

const SECOND = 1000;

const timers: Record<string, ActiveTimer> = {};

export const getTimer = (roomCode: string) => timers[roomCode].currentTime;

export const startRound = async (
  room: RoomDoc,
  io: SocketServer,
  logger: Logger
) => {
  const round = room.currentRound + 1;

  const interval = setInterval(() => {
    timers[room.code!].currentTime++;
  }, SECOND);

  const timeout = setTimeout(async () => {
    clearInterval(interval);

    io.to(room.code!).emit("round-timer-ended");

    timers[room.code!].uploadStatusInterval = setInterval(async () => {
      const updatedRoom = await Room.findOne({ code: room.code });

      if (canEndRound(updatedRoom!)) {
        await endRound(updatedRoom!, io, logger);
        return;
      }
    }, 5 * SECOND);
  }, room.roundTime * SECOND);

  await Room.updateOne(
    { code: room.code },
    {
      $inc: { currentRound: 1 },
    }
  );

  io.to(room.code!).emit("round-started", {
    currentRound: room.currentRound + 1,
  });

  timers[room.code!] = { interval, timeout, currentTime: 0, ended: false };
};

export const endRound = async (
  room: RoomDoc,
  io: SocketServer,
  logger: Logger
) => {
  clearInterval(timers[room.code!].interval);
  clearTimeout(timers[room.code!].timeout);

  const uploadStatusInterval = timers[room.code!].uploadStatusInterval;
  if (uploadStatusInterval) clearInterval(uploadStatusInterval);

  const gameEnded = room.currentRound === room.players.length - 1;

  if (gameEnded) {
    io.to(room.code!).emit("game-ended");

    await updateRoom(room, { isEnded: true });

    return;
  }

  startRound(room, io, logger);
};

export const canEndRound = (room: RoomDoc) => {
  const round = room.rounds[room.currentRound];
  const readyPlayers = round
    .filter(({ sent }) => sent)
    .map(({ player }) => player);
  const players = room.players;

  const notReadyPlayers = players.filter(
    (player) => !readyPlayers.includes(player.name)
  );

  const notReadyOnlinePlayers = notReadyPlayers.filter(
    (player) => player.isOnline
  );

  return !notReadyOnlinePlayers.length;
};
