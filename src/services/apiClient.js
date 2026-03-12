import axios from "axios";
import { apiUrl } from "./ApplicantAPIService.js";

const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

// -----------------------------------
// Add subscribers (pending requests)
// -----------------------------------
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// -----------------------------------
// Notify all subscribers with new token
// -----------------------------------
const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// -----------------------------------
// REQUEST INTERCEPTOR
// -----------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------
// RESPONSE INTERCEPTOR
// -----------------------------------
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // only handle 401
    if (error.response?.status === 401 && !originalRequest._retry) {

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.clear();
        window.location.replace("/candidate");
        return Promise.reject(error);
      }

      // -----------------------------
      // If refresh already running
      // -----------------------------
      if (isRefreshing) {

        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {

            originalRequest.headers.Authorization = `Bearer ${token}`;

            resolve(apiClient(originalRequest));

          });
        });

      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        const response = await axios.post(
          `${apiUrl}/auth/refreshToken`,
          { token: refreshToken }
        );

        const newToken = response.data.data.jwt;
        const newRefreshToken = response.data.data.refreshToken;

        // save tokens
        localStorage.setItem("jwtToken", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // update default header
        apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;

        // notify waiting requests
        onRefreshed(newToken);

        // retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);

      } catch (err) {

        localStorage.clear();
        window.location.replace("/candidate");

        return Promise.reject(err);

      } finally {

        isRefreshing = false;

      }

    }

    return Promise.reject(error);

  }
);

export default apiClient;