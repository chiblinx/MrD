import type { NextFunction, Request, Response } from "express";

import { validateSearchQuery } from "../common/validation/search-query.validator.js";
import type { SearchService } from "./search.service.js";

export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  handleSearch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categories = await this.searchService.getCategories();
      const criteria = validateSearchQuery(req.query, categories);
      const data = await this.searchService.search(criteria);

      console.info(
        `[search] q="${criteria.query}" category="${criteria.category ?? "all"}" sort="${criteria.sort}" results=${data.meta.total} duration=${data.meta.durationMs}ms enrichmentFailures=${data.meta.enrichmentFailures}`
      );

      res.json({ data });
    } catch (error) {
      next(error);
    }
  };
}
