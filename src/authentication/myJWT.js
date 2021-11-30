//Implementation using simplejwt on Django server
import { apiFetch } from "../helperFunctions";
import * as api from "../urls";

export function getToken({ data, onSuccess, onFailure }) {
  apiFetch({
    url: api.GET_TOKEN,
    method: "POST",
    data: data,
    onSuccess: (json) => {
      localStorage.setItem("access", json.access);
      localStorage.setItem("refresh", json.refresh);
      if (onSuccess) onSuccess();
    },
    onFailure: (error) => {
      console.log(error);
      clearToken({});
      if (onFailure) onFailure();
    },
  });
}

export function clearToken({ onSuccess }) {
  console.log("Logging out");
  localStorage.setItem("access", "");
  localStorage.setItem("refresh", "");
  if (onSuccess) onSuccess();
}

export function refreshToken({ onSuccess, onFailure }) {
  console.log("Refreshing token...");
  let data = {};
  try {
    data = { refresh: localStorage.getItem("refresh") };
  } catch {
    console.log("No refresh token in localStorage");
    if (onFailure) onFailure();
    return;
  }

  apiFetch({
    url: api.REFRESH_TOKEN,
    method: "POST",
    data: data,
    onSuccess: (json) => {
      console.log(json);
      localStorage.setItem("access", json.access);
      if (onSuccess) onSuccess();
    },
    onFailure: (error) => {
      console.log(`Refresh token error: ${error}`);
      clearToken({});
      if (onFailure) onFailure(error);
    },
  });
}
