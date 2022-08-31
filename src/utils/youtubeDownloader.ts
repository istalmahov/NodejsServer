import path from "path";
import { Logger } from "pino";
import { Config } from "../plugins/config";
import { YoutubeMp3Downloader } from "./youtubeMp3Downloader";

const YD = new YoutubeMp3Downloader({
  ffmpegPath: "/path/to/ffmpeg",
  outputPath: "../uploads/youtube",
  youtubeVideoQuality: "lowest",
  queueParallelism: 4,
  progressTimeout: 2000,
  allowWebm: true,
});

const YOUTUBE_UPLOADS_FOLDER = "youtube";

interface Callbacks {
  [key: string]: {
    resolve: (...args: any) => void;
    reject: (...args: any) => void;
  };
}

export class YoutubeDownloader {
  private callbacks: Callbacks = {};
  private downloader: YoutubeMp3Downloader;

  constructor(private logger: Logger, config: Config) {
    this.downloader = new YoutubeMp3Downloader({
      ffmpegPath: config.FFMPEG_PATH,
      outputPath: path.join(config.UPLOADS_PATH, YOUTUBE_UPLOADS_FOLDER),
      youtubeVideoQuality: "lowest",
      queueParallelism: 4,
      progressTimeout: 2000,
      allowWebm: true,
    });

    this.downloader.on("finished", this.onFinished.bind(this));
    this.downloader.on("error", this.onFinished.bind(this));
  }

  download(videoId: string, filename?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.registerCallbacks(videoId, resolve, reject);

      this.logger.debug({ videoId, filename }, "Started video downloading");

      this.downloader.download(videoId, filename);
    });
  }

  private registerCallbacks(videoId: string, resolve: any, reject: any) {
    this.callbacks[videoId] = { resolve, reject };
  }

  private removeCallbacks(videoId: string) {
    delete this.callbacks[videoId];
  }

  private onFinished(error: any, data: any) {
    console.log(data);
    console.log(error);

    const promise = this.callbacks[data.videoId];

    this.removeCallbacks(data.videoId);

    if (!promise)
      return this.logger.error(
        { data, error },
        "No callback for video download task"
      );

    if (error) return promise.reject(error);

    return promise.resolve(data);
  }
}
