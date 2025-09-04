import axios from "axios";
import { Cookies } from "quasar";

// const APIUrl = process.env.RestApiLocal;

const isPublic = process.env.Remote?.toUpperCase() === "PUBLIC";
const isDev = process.env.Platform?.toUpperCase() === "DEV";

const apiLocal = isDev
  ? isPublic
    ? process.env.RestApiPublic
    : process.env.RestApiLocal
  : isPublic
  ? process.env.RestApiProdPublic
  : process.env.RestApiProdLocal;

const apiPublic = `${apiLocal}/px-portal`;

const apiRoute = isPublic ? `${apiPublic}/doctor` : `${apiLocal}/doctors-kiosk`;

export default {
  async endPointCallGet(endPoint, token) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiRoute}/${endPoint}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async endPointCallPost(endPoint, data, token) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(`${apiRoute}/${endPoint}`, data, {
        headers,
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  async endPointCallGetParameter(endPoint, data, token) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${apiRoute}/${endPoint}`, {
        params: data,
        headers,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async endPointCallGetWithPathParam(endPoint, pathParam, token) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${apiRoute}/${endPoint}/${pathParam}`,
        headers
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delay(ms) {
    return new Promise((res) => setTimeout(() => res(), ms));
  },

  disablePointerEvents(duration) {
    document.body.classList.add("disable-pointer-events");

    if (duration) {
      setTimeout(() => {
        enablePointerEvents();
      }, duration);
    }
  },

  enablePointerEvents() {
    document.body.classList.remove("disable-pointer-events");
  },
};
