import { useState } from "react"
import DropboxChooser from "@/components/DropboxChooser"
import PageLayout from "../components/PageLayout"

import { getUploadFolder, setUploadFolder } from "@/state/upload-folder"

export default function FolderSelection() {
  const [ folder, setFolder ] = useState(getUploadFolder())

  function onFolderSelected(folderPath) {
    setFolder(folderPath)
  }

  let form = <DropboxChooser onSelected={onFolderSelected} label="Select folder" />

  function finish() {
    window.location.hash = ''
    setUploadFolder(folder)
  }

  if (folder) {
    form = <div>
      <p>Selected folder: { folder }</p>
      <div className="d-flex gap-2 flex-row">
        <DropboxChooser onSelected={onFolderSelected} label="Change" />
        <button onClick={finish}>Continue</button>
      </div>
    </div>
  }

  return (
    <PageLayout>
      <p>Please select which folder to use for photo upload. Open <a rel="noreferrer" target="_blank" href="https://www.dropbox.com/home">Dropbox</a> to create a new folder if needed.</p>
      { form }
    </PageLayout>
  )
}