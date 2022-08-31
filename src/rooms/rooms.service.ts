import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { PlayerDoc } from "../models/player";

import { Room, RoomDoc } from "../models/room";
import { Config } from "../plugins/config";
import { getNestedArrayUpdate } from "../utils/nestedArrayUpdate";

export const tokenResponse = (
  config: Config,
  code: string,
  player: string
) => ({
  code,
  token: jwt.sign({ room: code, player }, config.JWT_SECRET),
});

export const createRoom = async (room: Partial<RoomDoc>) => {
  return await Room.create({ rounds: [], ...room });
};

export const updateRoom = async (
  room: Partial<RoomDoc>,
  newRoom: Partial<RoomDoc>
) => {
  return Room.updateOne({ code: room.code }, newRoom);
};

export const deleteRoom = async (room: Partial<RoomDoc>) => {
  return await Room.remove(room);
};

export const addPlayer = async (code: string, player: Partial<PlayerDoc>) => {
  return await Room.updateOne(
    {
      code,
      "players.name": { $ne: player.name },
    },
    { $push: { players: player } },
    { runValidators: true }
  );
};

export const updatePlayer = async (
  room: RoomDoc,
  player: Partial<PlayerDoc>
) => {
  const updateObject = getNestedArrayUpdate<PlayerDoc>(
    ["players"],
    ["isOwner", "isOnline"],
    player
  );

  return Room.updateOne(
    { code: room.code, "players.name": player.name },
    updateObject
  );
};

export const removePlayer = async (
  room: RoomDoc,
  player: Pick<PlayerDoc, "name">
) => {
  const deletedPlayer = room.players.find((p) => p.name === player.name);

  if (!deletedPlayer) return;

  room.players = room.players.filter(
    (p) => p.name !== deletedPlayer.name
  ) as any;

  await room.save();

  return deletedPlayer;
};

export const getPreviousSong = (room: RoomDoc, player: PlayerDoc) => {
  const round = room.rounds[room.currentRound];

  const initialSongAuthor = round.find(
    (round) => round.player === player.name
  )?.song;

  const song = room.songs.get(initialSongAuthor!);

  let previousSong = "";

  for (let i = 1; i <= room.currentRound && !previousSong && song; i++) {
    previousSong = song[room.currentRound - i]
      ? song[room.currentRound - i].url
      : "";
  }

  return previousSong;
};

export const updateSongStatus = async (
  room: RoomDoc,
  player: PlayerDoc,
  status: boolean
) => {
  return await mongoose.connection.db.collection("rooms").updateOne(
    {
      code: room.code,
      [`rounds.${room.currentRound}.player`]: player.name,
    },
    {
      $set: {
        [`rounds.${room.currentRound}.$.sent`]: status,
      },
    }
  );
};
