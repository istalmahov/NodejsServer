import { RawServerBase, RouteOptions } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import fetch from "node-fetch";
import { Logger } from "pino";
import { URL } from "url";
import { Config } from "../../plugins/config";
import { roomGuard } from "../../utils/roomGuard";
import { YoutubeDownloader } from "../../utils/youtubeDownloader";

export const youtubeDownloadRoute = (
  config: Config,
  logger: Logger,
  youtubeDownloader: YoutubeDownloader
): RouteOptions<
  RawServerBase,
  IncomingMessage,
  ServerResponse,
  {
    Params: {
      videoId: string;
    };
  }
> => ({
  method: "GET",
  url: "/youtube/:videoId",
  schema: {},
  preHandler: roomGuard(config, logger),
  handler: async (req) => {
    console.log(req.params.videoId);

    const result = await youtubeDownloader.download(req.params.videoId);

    const file = result.file.split("uploads/")[1];

    return { name: result.title, url: `/uploads/${file}` };
  },
});
