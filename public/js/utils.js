export const DEFAULT_SORT = "relevance";
const SORT_STORAGE_KEY = "local-table-search.sort";
const SUPPORTED_SORTS = new Set([
  DEFAULT_SORT,
  "popularity-desc",
  "popularity-asc",
  "name-asc"
]);

export function getInitialCriteria(
  locationSearch = window.location.search,
  storage
) {
  const criteria = getCriteriaFromUrl(locationSearch);
  const params = new URLSearchParams(locationSearch);

  if (params.has("sort")) {
    return criteria;
  }

  return {
    ...criteria,
    sort: readPersistedSort(storage)
  };
}

export function getCriteriaFromUrl(locationSearch = window.location.search) {
  const params = new URLSearchParams(locationSearch);

  return {
    q: (params.get("q") ?? "").trim(),
    category: (params.get("category") ?? "").trim(),
    sort: (params.get("sort") ?? DEFAULT_SORT).trim() || DEFAULT_SORT
  };
}

export function writeCriteriaToUrl(criteria, mode = "replace") {
  const params = new URLSearchParams();
  const normalised = normaliseCriteria(criteria);

  if (normalised.q) {
    params.set("q", normalised.q);
  }

  if (normalised.category) {
    params.set("category", normalised.category);
  }

  if (normalised.sort !== DEFAULT_SORT) {
    params.set("sort", normalised.sort);
  }

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
  const method = mode === "push" ? "pushState" : "replaceState";

  window.history[method](null, "", nextUrl);
}

export function normaliseCriteria(criteria) {
  return {
    q: (criteria.q ?? "").trim(),
    category: (criteria.category ?? "").trim(),
    sort: (criteria.sort ?? DEFAULT_SORT).trim() || DEFAULT_SORT
  };
}

export function persistSort(sort, storage) {
  if (!SUPPORTED_SORTS.has(sort)) {
    return;
  }

  try {
    const targetStorage = storage ?? window.localStorage;
    targetStorage.setItem(SORT_STORAGE_KEY, sort);
  } catch (_error) {

  }
}

function readPersistedSort(storage) {
  try {
    const targetStorage = storage ?? window.localStorage;
    const storedSort = targetStorage.getItem(SORT_STORAGE_KEY);
    return storedSort && SUPPORTED_SORTS.has(storedSort) ? storedSort : DEFAULT_SORT;
  } catch (_error) {
    return DEFAULT_SORT;
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR"
  }).format(value);
}

export function pluralise(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}
