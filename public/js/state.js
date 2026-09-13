const DEFAULT_STATE = {
  q: "",
  category: "",
  sort: "relevance",
  status: "initial",
  items: [],
  meta: null,
  error: null,
  categories: []
};

export function createSearchStore(initialState = {}) {
  let state = {
    ...DEFAULT_STATE,
    ...initialState
  };
  const subscribers = new Set();

  function getState() {
    return state;
  }

  function setState(patch) {
    state = {
      ...state,
      ...patch
    };

    subscribers.forEach((subscriber) => subscriber(state));
  }

  function subscribe(subscriber) {
    subscribers.add(subscriber);
    subscriber(state);

    return () => {
      subscribers.delete(subscriber);
    };
  }

  return {
    getState,
    setState,
    subscribe
  };
}
