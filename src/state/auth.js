import { DropboxAuth } from "dropbox";

const redirectUri = window.location.origin + window.location.pathname + '?authenticated=true';

const ACCESS_TOKEN_KEY = 'dropbox-photo-upload::token'
const REFRESH_TOKEN_KEY = 'dropbox-photo-upload::refresh_token'
const CODE_VERIFIER_KEY = 'dropbox-photo-upload::code_verifier'

const auth = new DropboxAuth({
  clientId: import.meta.env.VITE_DROPBOX_CLIENT_ID,
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  accessTokenExpiresAt: new Date(Date.now() - 1000),
});

export async function login() {
  const authUrl = await auth.getAuthenticationUrl(redirectUri, null, 'code', 'offline', undefined, 'user', true);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.setItem(CODE_VERIFIER_KEY, auth.getCodeVerifier());
  location.href = authUrl;
}

// Parses the url and gets the access token if it is in the urls hash
function getCodeFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get('code');
}

// If the user was just redirected from authenticating, the urls hash will
// contain the access token.
function hasRedirectedFromAuth() {
    return !!getCodeFromUrl();
}

export function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + (expiresIn * 1000));
}

export async function handleLoginRedirect() {
  if (!hasRedirectedFromAuth()) {
    return isLoggedIn()
  }

  auth.setCodeVerifier(localStorage.getItem(CODE_VERIFIER_KEY));
  const authResult = await auth.getAccessTokenFromCode(redirectUri, getCodeFromUrl());
  auth.setAccessToken(authResult.result.access_token);
  auth.setAccessTokenExpiresAt(getTokenExpiresAtDate(authResult.result.expires_in));
  auth.setRefreshToken(authResult.result.refresh_token);
  localStorage.setItem(ACCESS_TOKEN_KEY, authResult.result.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, authResult.result.refresh_token);

  // clean the current url from login query params
  window.history.replaceState({}, document.title, window.location.pathname)

  return !!authResult.result.access_token;
}

export function isLoggedIn() {
  return !!auth.getAccessToken();
}

export function logout() {
  localStorage.clear();
  auth.setAccessToken(undefined);
  window.location.replace(window.location.origin)
  return false
}

export function getDropboxAuth() {
  return auth
}