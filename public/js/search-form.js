export function initSearchForm({ store, onSearch }) {
  const form = document.querySelector("#search-form");
  const searchInput = document.querySelector("#search-input");
  const categorySelect = document.querySelector("#category-select");
  const sortSelect = document.querySelector("#sort-select");
  const clearButton = document.querySelector("#clear-button");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onSearch(readCriteria(), { historyMode: "push" });
  });

  categorySelect.addEventListener("change", () => {
    onSearch(readCriteria(), { historyMode: "replace" });
  });

  sortSelect.addEventListener("change", () => {
    onSearch(readCriteria(), { historyMode: "replace" });
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    categorySelect.value = "";
    sortSelect.value = "relevance";
    onSearch(readCriteria(), { historyMode: "push" });
    searchInput.focus();
  });

  store.subscribe((state) => {
    syncCategories(categorySelect, state.categories, state.category);
    syncValue(searchInput, state.q);
    syncValue(categorySelect, state.category);
    syncValue(sortSelect, state.sort);
    form.dataset.status = state.status;

  });

  function readCriteria() {
    return {
      q: searchInput.value,
      category: categorySelect.value,
      sort: sortSelect.value
    };
  }
}

function syncValue(element, value) {
  const nextValue = value ?? "";

  if (element.value !== nextValue) {
    element.value = nextValue;
  }
}

function syncCategories(select, categories, selectedCategory) {
  const existingCategories = Array.from(select.options)
    .slice(1)
    .map((option) => option.value);

  if (arraysMatch(existingCategories, categories)) {
    return;
  }

  select.replaceChildren(createOption("", "All categories"));

  categories.forEach((category) => {
    select.append(createOption(category, category));
  });

  if (selectedCategory && !categories.includes(selectedCategory)) {
    select.append(createOption(selectedCategory, selectedCategory));
  }
}

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function arraysMatch(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
