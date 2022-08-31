import dotenv from "dotenv";

export interface Config {
  MONGO_DB_DATABASE: string;
  MONGO_DB_HOST: string;
  MONGO_DB_PORT: string;
  JWT_SECRET: string;
  PORT: string;
  LOG_LEVEL: string;
  FREESOUND_API_URL: string;
  FREESOUND_CLIENT_ID: string;
  FREESOUND_API_KEY: string;
  SERVER_URL: string;

  FFMPEG_PATH: string;
  UPLOADS_PATH: string;
}

export const loadConfig = (extraOptions: Partial<Config> = {}) => {
  return {
    ...dotenv.config().parsed,
    ...process.env,
    ...extraOptions,
  } as Config;
};
