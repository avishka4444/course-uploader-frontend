import Axios from "axios";

export const axios = Axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const isAxiosError = Axios.isAxiosError;
