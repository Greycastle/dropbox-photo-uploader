const SELECTED_FOLDER_KEY = 'dropbox-photo-upload::selected-folder';

export function getUploadFolder() {
  return localStorage.getItem(SELECTED_FOLDER_KEY) || null
}

export function setUploadFolder(folder) {
  localStorage.setItem(SELECTED_FOLDER_KEY, folder);
}