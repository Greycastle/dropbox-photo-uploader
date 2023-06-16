import { getToken } from '@/state/auth-token'

async function convertDataUrlToOctetStream(dataUrl) {
  const response = await fetch(dataUrl);
  return await response.blob();
}

export default async function uploadFile(path, dataUrl) {
  const data = await convertDataUrlToOctetStream(dataUrl)
  const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
    headers: {
      'authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({ path, autorename: false })
    },
    method: 'POST',
    body: data
  })

  if (response.status === 200) {
    return
  }
  if (response.status === 409) {
    console.log('File already exists: ' + path)
    return
  }
  if (response.status === 401) {
    throw new Error('Unauthorized')
  }
  const responseJson = await response.json()
  console.error(`Failed to upload: ${path}`, responseJson)
  throw new Error(`Failed to upload: ${path}`);
}