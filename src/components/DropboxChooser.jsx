import { useEffect } from "react";
import PropTypes from "prop-types";
import { Dropbox } from "dropbox";
import { getDropboxAuth } from '@/state/auth'

export default function DropboxChooser({ onSelected, label }) {
  useEffect(() => {
    // Skip if already registered
    if (document.getElementById('dropboxjs')) {
      return
    }
    const script = document.createElement('script')
    script.src = 'https://www.dropbox.com/static/api/2/dropins.js'
    script.id = 'dropboxjs'
    script.setAttribute('data-app-key', import.meta.env.VITE_DROPBOX_CLIENT_ID)
    document.body.appendChild(script)
  }, [])

  function openChooser() {
    const options = {
      success: async (files) => {
        // Because the chooser gives us only the id and name, not the path
        // we have to jump through several hoops to get the full path of the folder

        // 1. Get the lowercase path using the url of the link created
        const client = new Dropbox({ auth: getDropboxAuth() })
        const linkMetaData = await client.sharingGetSharedLinkMetadata({ url: files[0].link })
        const pathLower = linkMetaData.result.path_lower

        // 2. Then using that path we can lookup the folder and get the full path with case
        const metaData = await client.filesGetMetadata({ path: pathLower })
        const path = metaData.result.path_display

        onSelected(path);
      },
      folderselect: true,
    }
    window.Dropbox.choose(options)
  }

  return <button onClick={openChooser}>{ label || 'Select from Dropbox' }</button>
}

DropboxChooser.propTypes = {
  onSelected: PropTypes.func.isRequired,
  label: PropTypes.string,
}