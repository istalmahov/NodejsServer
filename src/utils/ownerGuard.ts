import { preHandlerAsyncHookHandler } from "fastify";
import { ForbiddenError } from "./errors";
import { getRoomGuardData } from "./roomGuard";

export const ownerGuard: preHandlerAsyncHookHandler = async (req, reply) => {
  const { player } = getRoomGuardData(req);

  if (!player?.isOwner) throw new ForbiddenError("You are not an owner");
};
