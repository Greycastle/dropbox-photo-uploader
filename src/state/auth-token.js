const storageKey = 'photo_uploader_token';

export function setToken(token) {
  localStorage.setItem(storageKey, token)
}

export function clearToken() {
  localStorage.removeItem(storageKey)
}

export function getToken() {
  return localStorage.getItem(storageKey) ?? null
}