import { RawServerBase, RouteOptions } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import fetch from "node-fetch";
import { Logger } from "pino";
import { URL } from "url";
import { Config } from "../../plugins/config";
import { roomGuard } from "../../utils/roomGuard";

export const searchSampleRoute = (
  config: Config,
  logger: Logger
): RouteOptions<
  RawServerBase,
  IncomingMessage,
  ServerResponse,
  {
    Querystring: {
      query: string;
      weights: string;
      page: string;
    };
  }
> => ({
  method: "GET",
  url: "/",
  schema: {},
  preHandler: roomGuard(config, logger),
  handler: async (req) => {
    console.log(req.body);

    const url = new URL(`${config.FREESOUND_API_URL}/search/text/`);

    url.searchParams.set("fields", "name,previews,id,duration");
    url.searchParams.set("query", req.query.query);
    url.searchParams.set("weights", req.query.weights);
    url.searchParams.set("page", req.query.page);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Token ${config.FREESOUND_API_KEY}`,
      },
    });

    const json = await res.json();

    logger.debug(json, "FREESOUND RESULT");

    json.next = getSearchParamsObject(json.next);
    json.previous = getSearchParamsObject(json.previous);

    return json;
  },
});

const getSearchParamsObject = (url: string) => {
  if (!url) return null;

  const query = new URL(url).search;

  console.log(query);

  const searchParams = new URLSearchParams(query);

  return Object.fromEntries(searchParams);
};
