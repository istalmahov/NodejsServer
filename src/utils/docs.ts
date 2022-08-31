import Joi from "joi";
import { loadConfig } from "../plugins/config";
const parse = require("joi-to-json");

const { PORT } = loadConfig();

export const swaggerOptions = {
  routePrefix: "/docs",
  exposeRoute: true,
  swagger: {
    info: {
      title: "mewl server docs",
      description: "Documentation for mewl API",
      version: "0.1.0",
    },
    tags: [
      { name: "room", description: "Room related end-points" },
      { name: "game", description: "Game related end-points" },
    ],
    host: `localhost:${PORT}`,
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
  },
  transform: (docsObject: any) => {
    // Checking all schema keys
    docsObject.schema = Object.keys(docsObject.schema).reduce((o: any, key) => {
      // If this is a key useful for docs, we check if it is a Joi schema
      o[key] =
        ["params", "body", "querystring", "headers"].includes(key) &&
        Joi.isSchema(docsObject.schema[key])
          ? // If it is a Joi schema we convert it to JSON-schema
            parse(docsObject.schema[key])
          : // Leave it unchanged otherwise
            docsObject.schema[key];

      return o;
    }, {});

    return docsObject;
  },
};
