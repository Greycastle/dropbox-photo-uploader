import { Dropbox } from 'dropbox'
import { getDropboxAuth } from '@/state/auth'
import { getPathRoot } from './get-path-root'

export default async function createFolder(path) {
  const pathRoot = await getPathRoot()
  const client = new Dropbox({ auth: getDropboxAuth(), pathRoot })

  try {
    await client.filesCreateFolderV2({ path: path, autorename: false })
  } catch (err) {
    if (err?.error?.error_summary?.includes('path/conflict/folder')) {
      console.log('Folder already exists')
      return
    }
    console.log(`Failed to create folder ${err}`)
    throw new Error(`Failed to create folder ${err}`)
  }
}