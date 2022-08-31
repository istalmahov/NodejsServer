import { Schema, Document } from "mongoose";

export class PlayerDoc extends Document {
  name!: string;
  avatar!: string;
  isOwner!: boolean;
  isOnline!: boolean;
}

export const playerSchema = new Schema<PlayerDoc>({
  name: { type: String, minlength: 3, maxlength: 15, required: true },

  avatar: { type: String, required: false, default: "" },

  isOwner: { type: Boolean, default: false },

  isOnline: { type: Boolean, default: false },
});
