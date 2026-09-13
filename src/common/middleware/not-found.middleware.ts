import type { RequestHandler } from "express";

import { NotFoundError } from "../errors/http-error.js";

export const apiNotFoundMiddleware: RequestHandler = (_req, _res, next) => {
  next(new NotFoundError("The requested API endpoint was not found."));
};
