import { BadRequestError } from "../errors/http-error.js";
import { SORT_OPTIONS, type SearchCriteria, type SortOption } from "../../search/search.types.js";

type QueryValue = string | string[] | object | undefined;

const SORT_OPTION_SET = new Set<string>(SORT_OPTIONS);

export function validateSearchQuery(
  query: Record<string, QueryValue>,
  categories: readonly string[]
): SearchCriteria {
  const searchTerm = readOptionalString(query.q, "q") ?? "";
  const rawCategory = readOptionalString(query.category, "category");
  const rawSort = readOptionalString(query.sort, "sort") ?? "relevance";

  if (!SORT_OPTION_SET.has(rawSort)) {
    throw new BadRequestError(
      `sort must be one of: ${SORT_OPTIONS.join(", ")}.`
    );
  }

  return {
    query: searchTerm.trim(),
    category: normaliseCategory(rawCategory, categories),
    sort: rawSort as SortOption
  };
}

function readOptionalString(value: QueryValue, fieldName: string): string | null {
  if (value === undefined) {
    return null;
  }

  if (Array.isArray(value) || typeof value !== "string") {
    throw new BadRequestError(`${fieldName} must be a string.`);
  }

  return value.trim();
}

function normaliseCategory(
  rawCategory: string | null,
  categories: readonly string[]
): string | null {
  if (!rawCategory) {
    return null;
  }

  const matchingCategory = categories.find(
    (category) => category.toLowerCase() === rawCategory.toLowerCase()
  );

  if (!matchingCategory) {
    throw new BadRequestError(
      `category must be one of: ${categories.join(", ")}.`
    );
  }

  return matchingCategory;
}
