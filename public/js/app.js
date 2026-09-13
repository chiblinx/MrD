import { isAbortError, searchCatalog } from "./api.js";
import { initResultsRenderer } from "./results.js";
import { initSearchForm } from "./search-form.js";
import { createSearchStore } from "./state.js";
import {
  getCriteriaFromUrl,
  getInitialCriteria,
  normaliseCriteria,
  persistSort,
  writeCriteriaToUrl
} from "./utils.js";

const initialCriteria = normaliseCriteria(getInitialCriteria());
const store = createSearchStore({
  ...initialCriteria
});

let latestRequestId = 0;

initSearchForm({
  store,
  onSearch: (criteria, options) => {
    void runSearch(criteria, options);
  }
});
initResultsRenderer({ store });

window.addEventListener("popstate", () => {
  void runSearch(getCriteriaFromUrl(), { syncUrl: false });
});

void runSearch(initialCriteria, { syncUrl: false });

async function runSearch(criteria, options = {}) {
  const normalised = normaliseCriteria(criteria);
  const requestId = latestRequestId + 1;
  latestRequestId = requestId;

  persistSort(normalised.sort);

  if (options.syncUrl !== false) {
    writeCriteriaToUrl(normalised, options.historyMode ?? "replace");
  }

  store.setState({
    ...normalised,
    status: "loading",
    error: null
  });

  try {
    const data = await searchCatalog(normalised);

    if (requestId !== latestRequestId) {
      return;
    }

    store.setState({
      q: data.meta.query,
      category: data.meta.category ?? "",
      sort: data.meta.sort,
      status: "success",
      items: data.items,
      meta: data.meta,
      categories: [...data.meta.categories],
      error: null
    });
  } catch (error) {
    if (isAbortError(error) || requestId !== latestRequestId) {
      return;
    }

    store.setState({
      status: "error",
      items: [],
      meta: null,
      error: {
        message: error.message ?? "Something went wrong while searching."
      }
    });
  }
}
