import { Dropbox } from 'dropbox'
import { getToken } from '@/state/auth-token'

async function convertDataUrlToOctetStream(dataUrl) {
  const response = await fetch(dataUrl);
  return await response.blob();
}

export default async function uploadFile(path, dataUrl) {
  const data = await convertDataUrlToOctetStream(dataUrl)

  try {
    const client = new Dropbox({ accessToken: getToken() })
    await client.filesUpload({ path, contents: data, autorename: false })
  } catch (err) {
    console.log(`Failed to upload file ${err.error.error_summary}`)
    throw new Error(`Failed to upload file ${err.error.error_summary}`)
  }
}