import { DropboxAuth } from "dropbox";

const redirectUri = window.location.origin + window.location.pathname + '?authenticated=true';

const auth = new DropboxAuth({
  clientId: import.meta.env.VITE_DROPBOX_CLIENT_ID,
  accessToken: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refresh_token'),
  accessTokenExpiresAt: new Date(Date.now() - 1000),
});

export async function login() {
  const authUrl = await auth.getAuthenticationUrl(redirectUri, null, 'code', 'offline', undefined, 'user', true);
  localStorage.removeItem('token');
  localStorage.setItem('code_verifier', auth.getCodeVerifier());
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

  auth.setCodeVerifier(localStorage.getItem('code_verifier'));
  const authResult = await auth.getAccessTokenFromCode(redirectUri, getCodeFromUrl());
  auth.setAccessToken(authResult.result.access_token);
  auth.setAccessTokenExpiresAt(getTokenExpiresAtDate(authResult.result.expires_in));
  auth.setRefreshToken(authResult.result.refresh_token);
  localStorage.setItem('token', authResult.result.access_token);
  localStorage.setItem('refresh_token', authResult.result.refresh_token);

  // clean the current url from login query params
  window.history.replaceState({}, document.title, window.location.pathname)

  return !!authResult.result.access_token;
}

export function isLoggedIn() {
  return !!auth.getAccessToken();
}

export function logout() {
  localStorage.removeItem('token');
  auth.setAccessToken(null);
  window.location = window.location.origin
}

export function getDropboxAuth() {
  return auth
}