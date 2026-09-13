import { describe, expect, it, vi } from "vitest";

import { getInitialCriteria, persistSort } from "./utils.js";

function createStorage(storedSort = null) {
  return {
    getItem: vi.fn(() => storedSort),
    setItem: vi.fn()
  };
}

describe("sort persistence", () => {
  it("uses the URL sort when one is present", () => {
    const storage = createStorage("name-asc");

    const criteria = getInitialCriteria("?sort=popularity-asc", storage);

    expect(criteria.sort).toBe("popularity-asc");
    expect(storage.getItem).not.toHaveBeenCalled();
  });

  it("restores a persisted sort when the URL does not contain one", () => {
    const storage = createStorage("popularity-desc");

    const criteria = getInitialCriteria("?q=burger&category=Burgers", storage);

    expect(criteria).toEqual({
      q: "burger",
      category: "Burgers",
      sort: "popularity-desc"
    });
  });

  it("ignores unsupported persisted sort values", () => {
    const storage = createStorage("price-asc");

    expect(getInitialCriteria("", storage).sort).toBe("relevance");
  });

  it("stores supported sort values", () => {
    const storage = createStorage();

    persistSort("name-asc", storage);

    expect(storage.setItem).toHaveBeenCalledWith("local-table-search.sort", "name-asc");
  });
});
