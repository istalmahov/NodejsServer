import mongoose from "mongoose";
import pino from "pino";
import { Room, RoomDoc } from "../models/room";
import { loadConfig } from "../plugins/config";
import { loadDatabase } from "../plugins/mongo";
import {
  addPlayer,
  createRoom,
  deleteRoom,
  getPreviousSong,
  removePlayer,
  updateRoom,
} from "./rooms.service";

const config = loadConfig();

beforeAll(async () => {
  await loadDatabase(config, pino({ level: "error" }));
});

afterAll(() => {
  mongoose.disconnect();
});

const player1: any = { name: "pl1", isOwner: true, isOnline: true };
const player2: any = { name: "pl2", isOwner: false, isOnline: true };

const room1 = {
  roundTime: 120,
  maximumPlayers: 2,
  players: [player1, player2],
};

test("room create, update, delete", async () => {
  const createdRoom = await createRoom(room1);

  expect(createdRoom).toBeDefined();
  expect(createdRoom.code).toBeDefined();

  expect(createdRoom.roundTime).toBe(room1.roundTime);
  expect(createdRoom.maximumPlayers).toBe(room1.maximumPlayers);
  expect(createdRoom.players.length).toBe(room1.players.length);

  await deleteRoom(createdRoom);
});

test("room create", async () => {
  const createdRoom = await createRoom(room1);

  const newMaximumPlayersValue = 10;

  const updateResult = await updateRoom(
    { code: createdRoom.code },
    { maximumPlayers: newMaximumPlayersValue }
  );

  expect(updateResult.modifiedCount).toBe(1);

  const updatedRoom = await Room.findOne({ code: createdRoom.code });

  expect(updatedRoom).toBeDefined();
  expect(updatedRoom?.maximumPlayers).toBe(newMaximumPlayersValue);

  await deleteRoom(createdRoom);
});

test("room update", async () => {
  const createdRoom = await createRoom(room1);

  const newMaximumPlayersValue = 10;

  const updateResult = await updateRoom(
    { code: createdRoom.code },
    { maximumPlayers: newMaximumPlayersValue }
  );

  expect(updateResult.modifiedCount).toBe(1);

  const updatedRoom = await Room.findOne({ code: createdRoom.code });

  expect(updatedRoom).toBeDefined();
  expect(updatedRoom?.maximumPlayers).toBe(newMaximumPlayersValue);

  await deleteRoom(createdRoom);
});

test("room add player", async () => {
  const createdRoom = await createRoom(room1);

  const newPlayer = { name: "new player", isOwner: false, isOnline: false };

  const updateResult = await addPlayer(createdRoom.code, newPlayer);

  expect(updateResult.modifiedCount).toBe(1);

  const updatedRoom = await Room.findOne({ code: createdRoom.code });

  expect(updatedRoom).toBeDefined();
  expect(updatedRoom?.players.length).toBe(3);

  await deleteRoom(createdRoom);
});

test("room remove player", async () => {
  const createdRoom = await createRoom(room1);

  await removePlayer(createdRoom, player1);

  const updatedRoom = await Room.findOne({ code: createdRoom.code });

  expect(updatedRoom).toBeDefined();
  expect(updatedRoom?.players.length).toBe(1);

  await deleteRoom(createdRoom);
});

test("room get round song", async () => {
  const songs = new Map();
  songs.set(player1.name, [{ player: player1.name, url: "song11" }]);
  songs.set(player2.name, [{ player: player2.name, url: "song12" }]);

  const createdRoom = await createRoom({
    ...room1,
    songs,
    rounds: [
      [
        { player: player1.name, sent: false, song: "" },
        { player: player2.name, sent: false, song: "" },
      ],
      [
        { player: player1.name, sent: false, song: player2.name },
        { player: player2.name, sent: false, song: player1.name },
      ],
    ],
    currentRound: 1,
  });

  const song = getPreviousSong(createdRoom, player1);

  expect(song).toBeDefined();
  expect(song).toBe("song12");

  await deleteRoom(createdRoom);
});
