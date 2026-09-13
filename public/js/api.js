import { normaliseCriteria } from "./utils.js";

let activeController = null;

export class ApiRequestError extends Error {
  constructor(message, { status = 0, code = "REQUEST_FAILED" } = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

export async function searchCatalog(criteria) {
  if (activeController) {
    activeController.abort();
  }

  const controller = new AbortController();
  activeController = controller;
  const url = new URL("/api/search", window.location.origin);
  const normalised = normaliseCriteria(criteria);

  if (normalised.q) {
    url.searchParams.set("q", normalised.q);
  }

  if (normalised.category) {
    url.searchParams.set("category", normalised.category);
  }

  if (normalised.sort !== "relevance") {
    url.searchParams.set("sort", normalised.sort);
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    const payload = await readJson(response);

    if (!response.ok) {
      throw new ApiRequestError(
        payload?.error?.message ?? "The search request failed.",
        {
          status: response.status,
          code: payload?.error?.code
        }
      );
    }

    return payload.data;
  } finally {
    if (activeController === controller) {
      activeController = null;
    }
  }
}

export function isAbortError(error) {
  return error instanceof DOMException && error.name === "AbortError";
}

async function readJson(response) {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}
