import { isJson } from "./isJson";

export const joiValidator =
  ({ schema }: any) =>
  (data: string) => {
    console.log(data);

    return schema.validate(data);
  };
