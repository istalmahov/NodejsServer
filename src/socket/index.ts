import { FastifyInstance } from "fastify";
import { Server, ServerOptions } from "socket.io";
import { SocketServer } from "./Socket";

export const startSocketServer = (
  app: FastifyInstance,
  options: Partial<ServerOptions> = {}
): SocketServer => {
  const io = new Server(app.server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    ...options,
  });

  app.addHook("onClose", (_, done) => {
    io.close();
    done();
  });

  return io;
};
