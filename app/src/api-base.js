export const resolveApiBase = () => {
  if (window.__API_BASE__) {
    return window.__API_BASE__.replace(/\/$/, "");
  }

  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, "");
  }

  const origin = window.location?.origin;
  if (origin && origin !== "null") {
    return origin.replace(/\/$/, "") + "/api";
  }

  return "http://127.0.0.1:4010/api";
};

export const apiBase = resolveApiBase();
