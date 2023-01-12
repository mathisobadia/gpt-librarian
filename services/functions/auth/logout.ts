import { ApiHandler } from "@serverless-stack/node/api";
import { respond } from "functions/utils";

export const handler = ApiHandler(async (event) => {
  return respond.redirectClearSession("/");
});
