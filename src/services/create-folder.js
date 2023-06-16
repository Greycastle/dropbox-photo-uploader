import { Dropbox } from 'dropbox'
import { getDropboxAuth } from '@/state/auth'

export default async function createFolder(name) {
  const client = new Dropbox({ auth: getDropboxAuth() })
  try {
    await client.filesCreateFolderV2({ path: '/' + name, autorename: false })
  } catch (err) {
    if (err.error.error_summary.includes('path/conflict/folder')) {
      console.log('Folder already exists')
      return
    }
    console.log(`Failed to create folder ${err}`)
    throw new Error(`Failed to create folder ${err}`)
  }
}