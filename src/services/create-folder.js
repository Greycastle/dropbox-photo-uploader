import { getToken } from '@/state/auth-token'

export default async function createFolder(name) {
  const response = await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
    headers: {
      'authorization': `Bearer ${getToken()}`,
      'content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      path: '/' + name,
      autorename: false
    })
  })

  if (response.status === 200) {
    return
  }

  if (response.status === 409) {
    console.log('Folder already exists')
    return
  }

  if (response.status === 401) {
    throw new Error('Unauthorized')
  }

  const data = await response.json()
  console.log(`Failed to create folder ${response.status}`, data)
  throw new Error(`Failed to create folder ${response.status}`)
}