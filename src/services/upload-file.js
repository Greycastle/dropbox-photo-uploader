import { Dropbox } from 'dropbox'
import { getDropboxAuth } from '@/state/auth'
import { getPathRoot } from './get-path-root';

async function convertDataUrlToOctetStream(dataUrl) {
  const response = await fetch(dataUrl);
  return await response.blob();
}

export default async function uploadFile(path, dataUrl) {
  const data = await convertDataUrlToOctetStream(dataUrl)

  try {
    const pathRoot = await getPathRoot()
    const client = new Dropbox({ auth: getDropboxAuth(), pathRoot })
    await client.filesUpload({ path, contents: data, autorename: false })
  } catch (err) {
    if (err.status === 409) {
      throw new Error(`File already exists at path ${path}`)
    }
    console.log(`Failed to upload file ${err}`)
    throw new Error(`Failed to upload file ${err}`)
  }
}