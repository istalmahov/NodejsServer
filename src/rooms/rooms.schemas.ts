import Joi from "joi";

export const createRoomSchema = Joi.object()
  .description("The only required field is players array with user's name")
  .keys({
    maximumPlayers: Joi.number().min(2).max(16).default(10),
    roundTime: Joi.number().min(60).max(180).default(120),
  })
  .required()
  .options({ stripUnknown: true });

export const updateRoomSchema = Joi.object()
  .keys({
    maximumPlayers: Joi.number().min(2).max(16),
    roundTime: Joi.number().min(60).max(180),
  })
  .required()
  .options({ stripUnknown: true });

export const joinRoomBodySchema = Joi.object()
  .keys({
    name: Joi.string().min(3).max(15).required(),
    avatar: Joi.string().allow("", null).default(""),
    isOwner: Joi.boolean().valid(false).default(false),
    isOnline: Joi.boolean().valid(false).default(false),
  })
  .required()
  .options({ stripUnknown: true });

export const roomCodeParamsSchema = Joi.object()
  .keys({
    code: Joi.string().min(9).max(9).required(),
  })
  .required();

export const removePlayerParamsSchema = Joi.object().keys({
  name: Joi.string().min(3).max(15).required(),
});

export const songUploadBodySchema = Joi.object()
  .keys({
    file: Joi.object().required(),
  })
  .required();

export const authorizationHeaderSchema = Joi.object()
  .keys({
    authorization: Joi.string()
      .description(
        "You should provide JWT token that you received on room creation or joining"
      )
      .required(),
  })
  .options({ allowUnknown: true });

export const roomResponseSchema = Joi.object()
  .keys({
    maximumPlayers: Joi.number().description("Maximum amount of players"),
    roundTime: Joi.number().description(
      "Describes a round duration in seconds"
    ),
    players: Joi.array()
      .items(
        Joi.object().keys({
          name: Joi.string().min(3).max(15).required(),
          isOwner: Joi.boolean().required(),
          isOnline: Joi.boolean().required(),
        })
      )
      .required()
      .min(1)
      .description("Players, connected to the room"),
    isStarted: Joi.boolean()
      .required()
      .description("This field becomes true when game starts"),
    rounds: Joi.array()
      .items(
        Joi.object().keys({
          player: Joi.string().description("Player's name"),
          song: Joi.string().description(
            "A song, that this player must change"
          ),
          sent: Joi.boolean().description(
            "Becomes true when a player sends a song"
          ),
        })
      )
      .description("This field represents a rounds in a game"),
    currentRound: Joi.number().description(
      "Shows current round. Has value -1 before the game starts"
    ),
    isEnded: Joi.boolean().description("Becomes true when game ends"),
    code: Joi.string().description("Short unique room id").example("qMQcj_Ewz"),
  })
  .options({ allowUnknown: true });

export const getRoomResponseSchema = Joi.object().keys({
  200: roomResponseSchema,
});

export const sendSongHeadersSchema = authorizationHeaderSchema.keys({
  "content-type": Joi.string().regex(/multipart\/form-data/),
});
