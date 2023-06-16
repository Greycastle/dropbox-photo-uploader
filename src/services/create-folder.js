import { Dropbox } from 'dropbox'

import { getToken } from '@/state/auth-token'

export default async function createFolder(name) {
  const client = new Dropbox({ accessToken: getToken() })
  try {
    await client.filesCreateFolderV2({ path: '/' + name, autorename: false })
  } catch (err) {
    if (err.error.error_summary.includes('path/conflict/folder')) {
      console.log('Folder already exists')
      return
    }
    console.log(`Failed to create folder ${err.error.error_summary}`)
    throw new Error(`Failed to create folder ${err.error.error_summary}`)
  }
}