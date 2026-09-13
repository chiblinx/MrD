import { Router } from "express";

import type { SearchController } from "./search.controller.js";

export function createSearchRouter(searchController: SearchController): Router {
  const router = Router();

  router.get("/search", searchController.handleSearch);

  return router;
}
