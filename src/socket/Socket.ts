import { Server } from "socket.io";
import { PlayerDoc } from "../models/player";
import { RoomDoc } from "../models/room";

export interface ServerToClientEvents {
  "player-connected": (player: Partial<PlayerDoc>) => void;
  "player-updated": (player: Partial<PlayerDoc>) => void;
  "player-disconnected": (player: Partial<PlayerDoc>) => void;
  "player-ready": (player: Partial<PlayerDoc>) => void;
  "game-ended": () => void;
  "round-ended": () => void;
  "round-timer-ended": () => void;
  "round-started": (round: { currentRound: number }) => void;
  "room-updated": (room: Partial<RoomDoc>) => void;
}

export interface ClientToServerEvents {}

export interface InterServerEvents {}

export interface SocketData {
  room: string;
  player: string;
}

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
