import { FastifyReply, FastifyRequest, FastifyError } from "fastify";
import createError from "fastify-error";
import { Logger } from "pino";
import { Config } from "../plugins/config";

export const BadRequestError = createError("BAD_REQUEST", "%s", 400);
export const NotAuthorizedError = createError("WRONG_TOKEN", "%s", 401);
export const ForbiddenError = createError("FORBIDDEN", "%s", 403);
export const NotFoundError = createError("NOT_FOUND", "%s", 404);

export const errorHandler =
  (config: Config, logger: Logger) =>
  (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    logger.debug(error);

    if (error.name === "ValidationError") error.statusCode = 400;

    reply.status(error.statusCode || 500).send({
      message: error.message,
      error: error.name,
      statusCode: error.statusCode || 500,
    });
  };
