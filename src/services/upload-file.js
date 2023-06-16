import { Dropbox } from 'dropbox'
import { getDropboxAuth } from '@/state/auth'

async function convertDataUrlToOctetStream(dataUrl) {
  const response = await fetch(dataUrl);
  return await response.blob();
}

export default async function uploadFile(path, dataUrl) {
  const data = await convertDataUrlToOctetStream(dataUrl)

  try {
    const client = new Dropbox({ auth: getDropboxAuth() })
    await client.filesUpload({ path, contents: data, autorename: false })
  } catch (err) {
    console.log(`Failed to upload file ${err}`)
    throw new Error(`Failed to upload file ${err}`)
  }
}