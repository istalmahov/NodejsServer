import { FastifyPluginAsync } from "fastify";
import { Logger } from "pino";
import { Server } from "socket.io";
import { Config } from "../plugins/config";
import { YoutubeDownloader } from "../utils/youtubeDownloader";
import { searchSampleRoute } from "./controllers/search";
import { youtubeDownloadRoute } from "./controllers/youtube";

export const SAMPLES_ROUTE_PREFIX = "/samples";

export const sampleRoutes =
  (config: Config, logger: Logger, io: Server): FastifyPluginAsync =>
  async (app) => {
    const youtubeDownloader = new YoutubeDownloader(
      logger.child({ name: "youtube-downloader" }),
      config
    );

    app
      .route(searchSampleRoute(config, logger.child({ name: "search-sample" })))
      .route(
        youtubeDownloadRoute(
          config,
          logger.child({ name: "youtube-download-route" }),
          youtubeDownloader
        )
      );
  };
