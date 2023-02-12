import User from "../domain/user";

export function saveTokenAndUser(token: string, user: User) {
  // Update token in storage
  window.localStorage.setItem("token", token);
  window.localStorage.setItem("address", user.address);

  if (user.username) {
    window.localStorage.setItem("username", user.username);
  }
}

export function getUser() {
  const address = window.localStorage.getItem("address");
  const username = window.localStorage.getItem("username") || "";

  if (address) {
    return new User({ id: address, address, username });
  }

  return null;
}

export function deleteTokenAndUser() {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("address");
  window.localStorage.removeItem("username");
}

export function getToken() {
  return window.localStorage.getItem("token");
}

export function isTokenValid() {
  const token = getToken();
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp > Date.now() / 1000;
  }

  return false;
}
