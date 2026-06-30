export const ADMIN_TOKEN_COOKIE = "dietologist_admin_token";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split("; ");

  const cookie = cookies.find((row) => row.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1]);
}

export function getAdminToken(): string | null {
  return getCookie(ADMIN_TOKEN_COOKIE);
}

export function setAdminToken(token: string, expiresAtUtc: string) {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date(expiresAtUtc).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${ADMIN_TOKEN_COOKIE}=${encodeURIComponent(
    token
  )}; Path=/; Expires=${expires}; SameSite=Lax${secure}`;
}

export function clearAdminToken() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ADMIN_TOKEN_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}