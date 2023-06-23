import { Dropbox } from 'dropbox'
import { getDropboxAuth } from '@/state/auth'

let pathRoot = null

export async function getPathRoot() {
  if (pathRoot) {
    return pathRoot
  }

  const response = await new Dropbox({ auth: getDropboxAuth() }).usersGetCurrentAccount()
  const namespaceId = response.result.root_info.root_namespace_id

  pathRoot = JSON.stringify({ '.tag': 'namespace_id', namespace_id: namespaceId })
  return pathRoot
}