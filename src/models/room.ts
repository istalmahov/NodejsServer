import shortid from "shortid";
import { Types, Schema, Document, model } from "mongoose";
import { PlayerDoc, playerSchema } from "./player";

export interface RoomDoc extends Document {
  code: string;
  maximumPlayers: number;
  roundTime: number;
  players: PlayerDoc[];
  isStarted: boolean;
  rounds: {
    player: string;
    song: string;
    sent: boolean;
  }[][];
  songs: Map<string, { player: string; url: string }[]>;
  currentRound: number;
  isEnded: boolean;
}

const roomSchema = new Schema<RoomDoc>({
  code: {
    type: String,
    unique: true,
  },

  maximumPlayers: { type: Number, min: 2, max: 16, required: true },
  roundTime: { type: Number, min: 60, max: 180, required: true },
  players: [{ type: playerSchema }],
  isStarted: { type: Boolean, default: false },
  rounds: [[{ type: { player: String, song: String, sent: Boolean } }]],
  songs: {
    type: Map,
    of: [
      {
        player: String,
        url: String,
      },
    ],
  },
  currentRound: { type: Number, default: -1 },
  isEnded: { type: Boolean, default: false },
});

roomSchema.pre("save", function (this: RoomDoc, next) {
  if (!this.code) this.code = shortid.generate();

  next();
});

export const Room = model("Room", roomSchema);
