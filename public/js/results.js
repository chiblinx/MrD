import { formatCurrency, pluralise } from "./utils.js";

export function initResultsRenderer({ store }) {
  const resultsGrid = document.querySelector("#results-grid");
  const status = document.querySelector("#results-status");
  const partialAlert = document.querySelector("#partial-alert");

  store.subscribe((state) => {
    resultsGrid.setAttribute("aria-busy", String(state.status === "loading"));
    partialAlert.hidden = true;
    partialAlert.textContent = "";
    resultsGrid.replaceChildren();

    if (state.status === "initial") {
      status.textContent = "Ready to search.";
      resultsGrid.append(createStateMessage("Start with a search", "Browse the catalog or search by meal, category or ingredient."));
      return;
    }

    if (state.status === "loading") {
      status.textContent = "Searching...";
      renderSkeletons(resultsGrid);
      return;
    }

    if (state.status === "error") {
      status.textContent = "Search failed.";
      resultsGrid.append(
        createStateMessage(
          "Search is temporarily unavailable",
          state.error?.message ?? "Please try again.",
          "error-state"
        )
      );
      return;
    }

    const total = state.meta?.total ?? state.items.length;
    status.textContent = `${total} ${pluralise(total, "result")} found`;

    if (total === 0) {
      resultsGrid.append(
        createStateMessage(
          "No matches found",
          "Try a different search term or remove the category filter.",
          "empty-state"
        )
      );
      return;
    }

    const failureCount = state.meta?.enrichmentFailures ?? 0;
    if (failureCount > 0) {
      partialAlert.hidden = false;
      partialAlert.textContent = `${failureCount} ${pluralise(
        failureCount,
        "item"
      )} returned without live pricing. The rest of the results are still available.`;
    }

    state.items.forEach((item) => {
      resultsGrid.append(createResultCard(item));
    });
  });
}

function createResultCard(item) {
  const article = document.createElement("article");
  article.className = "result-card";

  const media = document.createElement("div");
  media.className = "result-card__media";

  const fallback = document.createElement("div");
  fallback.className = "result-card__fallback";
  fallback.textContent = item.category.slice(0, 1);

  if (item.imageUrl) {
    const image = document.createElement("img");
    image.src = item.imageUrl;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.remove();
      media.append(fallback);
    });
    media.append(image);
  } else {
    media.append(fallback);
  }

  const body = document.createElement("div");
  body.className = "result-card__body";

  const topLine = document.createElement("div");
  topLine.className = "result-card__topline";

  const titleBlock = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = item.name;

  const category = document.createElement("div");
  category.className = "category";
  category.textContent = item.category;

  titleBlock.append(title, category);
  topLine.append(titleBlock, createPopularity(item.popularity));

  const description = document.createElement("p");
  description.className = "description";
  description.textContent = item.description;

  body.append(topLine, description, createEnrichmentMeta(item.enrichment));
  article.append(media, body);

  return article;
}

function createPopularity(popularity) {
  const element = document.createElement("span");
  element.className = "badge badge--unavailable";
  element.textContent = `${popularity}% liked`;
  return element;
}

function createEnrichmentMeta(enrichment) {
  const meta = document.createElement("div");
  meta.className = "result-card__meta";

  if (enrichment.status === "live-info-unavailable") {
    const badge = createBadge("Live info unavailable", "badge--warning");
    const message = document.createElement("p");
    message.className = "live-fallback";
    message.textContent = "Live pricing temporarily unavailable";
    meta.append(badge, message);
    return meta;
  }

  if (enrichment.status === "unavailable") {
    meta.append(createBadge("Unavailable", "badge--unavailable"));
  } else {
    meta.append(createBadge("Available", "badge--available"));
  }

  const price = document.createElement("span");
  price.className = "price";
  price.textContent = formatCurrency(enrichment.price);
  meta.append(price);

  if (enrichment.status === "available") {
    const delivery = document.createElement("span");
    delivery.className = "delivery";
    delivery.textContent = `${enrichment.deliveryEstimateMinutes} min delivery`;
    meta.append(delivery);
  }

  return meta;
}

function createBadge(label, modifier) {
  const badge = document.createElement("span");
  badge.className = `badge ${modifier}`;
  badge.textContent = label;
  return badge;
}

function createStateMessage(titleText, bodyText, className = "initial-state") {
  const wrapper = document.createElement("div");
  wrapper.className = className;

  const copy = document.createElement("div");
  copy.className = "state-copy";

  const title = document.createElement("h3");
  title.textContent = titleText;

  const body = document.createElement("p");
  body.textContent = bodyText;

  copy.append(title, body);
  wrapper.append(copy);

  return wrapper;
}

function renderSkeletons(container) {
  for (let index = 0; index < 6; index += 1) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.setAttribute("aria-hidden", "true");

    const thumb = document.createElement("div");
    thumb.className = "skeleton-thumb";

    const wide = document.createElement("div");
    wide.className = "skeleton-line skeleton-line--wide";

    const medium = document.createElement("div");
    medium.className = "skeleton-line skeleton-line--medium";

    const short = document.createElement("div");
    short.className = "skeleton-line skeleton-line--short";

    card.append(thumb, wide, medium, short);
    container.append(card);
  }
}
