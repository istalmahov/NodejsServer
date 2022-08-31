import { preValidationAsyncHookHandler } from "fastify";
import { createWriteStream } from "fs";
import path from "path";
import shortid from "shortid";
import { pipeline } from "stream";
import { promisify } from "util";

const pump = promisify(pipeline);

export const parseMultipart: preValidationAsyncHookHandler = async (
  req,
  reply
) => {
  const parts = req.parts();

  const body: any = {};

  for await (const part of parts) {
    if (part.file) {
      const extention = path.extname(part.filename);
      const filename = `${shortid()}${extention}`;
      await pump(
        part.file,
        createWriteStream(path.resolve(`./uploads/${filename}`))
      );
      body[part.fieldname] = filename;
    } else {
      body[part.fieldname] = (part as any).value;
    }

    console.log("ADDED ", part.fieldname);
  }

  console.log(body);

  req.body = body;
};
