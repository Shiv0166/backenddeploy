// API base URL for backend (Render). Override before this script loads:
// <script>window.__FOODHUB_API__ = 'https://your-api.onrender.com';</script>
(function () {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const localPort = window.__FOODHUB_PORT__ || "5000";
  const defaultApi = isLocal ? `http://localhost:${localPort}` : "";

  window.FOODHUB_API = (window.__FOODHUB_API__ || defaultApi).replace(/\/$/, "");

  window.apiUrl = function apiUrl(path) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${window.FOODHUB_API}${normalized}`;
  };
})();
