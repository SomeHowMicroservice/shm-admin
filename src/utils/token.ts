import Cookies from "js-cookie";

export const getAccessToken = () => {
  return Cookies.get("access_token");
};

export const getRefreshToken = () => {
  return Cookies.get("refresh_token");
};

export const setAccessToken = (token: string) => {
  Cookies.set("access_token", token);
};

export const setRefreshToken = (token: string) => {
  Cookies.set("refresh_token", token);
};

export const removeTokens = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
};
