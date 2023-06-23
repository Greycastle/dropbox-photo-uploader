import { useEffect, useState, useCallback } from "react"
import PageLayout from "../components/PageLayout"

import { setUploadFolder } from "@/state/upload-folder"
import { Dropbox } from "dropbox"
import { getDropboxAuth } from "../state/auth"
import { getPathRoot } from "../services/get-path-root"

export default function FolderSelection() {
  const [ currentFolder, setCurrentFolder ] = useState('')
  const [ subFolders, setSubFolders ] = useState([])
  const [ loading, setLoading ] = useState(false)
  const [ crumbs, setCrumbs ] = useState([])

  const loadSubFolders = async (parentFolder) => {
    setLoading(true)
    const pathRoot = await getPathRoot()
    const client = new Dropbox({ auth: getDropboxAuth(), pathRoot })
    let response = await client.filesListFolder({ path: parentFolder })

    if (response.result.has_more) {
      response = await client.filesListFolderContinue({ cursor: response.result.cursor })
    }

    const folders = response.result.entries.filter((entry) => entry['.tag'] === 'folder').map((entry) => entry.path_display)
    setSubFolders(folders)
    setLoading(false)
  }

  useEffect(() => {
    loadSubFolders(currentFolder)
  }, [ currentFolder ])

  const goBack = useCallback(() => {
    const parent = crumbs.pop()
    setCrumbs([ ...crumbs ])
    setCurrentFolder(parent)
  }, [ crumbs ])

  const openFolder = useCallback((folder) => {
    setCrumbs([ ...crumbs, currentFolder ])
    setCurrentFolder(folder)
  }, [ crumbs, currentFolder ])

  function finish() {
    window.location.hash = ''
    setUploadFolder(currentFolder)
  }

  const currentFolderName = currentFolder.length > 0 ? currentFolder : '/'

  return <PageLayout>
    <div>
      <div><span>Current folder:</span><br/><span style={{fontSize: '1.25rem'}}>{currentFolderName} { crumbs.length > 0 && <>(<span className="link" onClick={goBack}>up</span>)</> }</span></div>
      <button className="mt-2" onClick={finish}>Use this folder</button>
    </div>
    <div className="mt-4">Or, select a child folder:</div>
    { loading && <div className="mt-4">Loading...</div> }
    { !loading && <ul className="mt-4">
      { subFolders.map((folder) => <li className="link" style={{ cursor: 'pointer' }} key={folder} onClick={() => openFolder(folder)}>{ folder }</li>) }
    </ul> }

  </PageLayout>
}