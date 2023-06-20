const key = 'selected-folder';

export function getUploadFolder() {
  return localStorage.getItem(key) || null
}

export function setUploadFolder(folder) {
  localStorage.setItem(key, folder);
}