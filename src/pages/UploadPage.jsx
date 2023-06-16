import { useState, useRef, useCallback, useContext } from 'react'
import capitalize from '@/services/capitalize'
import uploadFiles from '@/services/upload-files'
import createFolder from '@/services/create-folder'
import FormContext from '@/state/form-context'

import LoginButton from '@/components/LoginButton'
import ImageCard from '@/components/ImageCard'

async function loadImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result)
    };

    reader.readAsDataURL(file);
  })
}

function logout() {
  localStorage.removeItem('photo_uploader_token')
  window.location = window.location.origin
}

export default function UploadPage() {
  const [ images, setImages ] = useState([])
  const [ uploadState, setUploadState ] = useState('pending')
  const [ errorInformation, setErrorInformation ] = useState(null)
  const fileButton = useRef(null)

  const handleFiles = async (event) => {
    const files = event.target.files;
    const newImages = await Promise.all(Array.from(files).map(loadImage))
    setImages([ ...images, ...newImages ])
  }

  const onRemove = useCallback((index) => {
    const updated = [ ...images ]
    updated.splice(index, 1)
    setImages(updated)
  }, [images])

  const formState = useContext(FormContext)

  const upload = useCallback(async () => {
    setUploadState('uploading')
    try {
      const folderName = `${capitalize(formState.firstName)}${capitalize(formState.lastName)}`
      await createFolder(folderName)
      await uploadFiles(folderName, images, formState)
      setImages([])
      formState.reset()
      setUploadState('success')
    } catch (err) {
      if (err.message === 'Unauthorized') {
        setUploadState('unauthorized')
      } else {
        setErrorInformation(err.toString())
        setUploadState('failed')
        console.error('Failed to upload', err);
      }
    }
  }, [ formState, images ])

  return <div className="w-100" style={ { 'maxWidth': '920px' } }>
    <header className="d-flex justify-content-between mb-4">
      <span className="title">Photo uploader</span>
      <div className="d-flex flex-row column-gap-4">
        <a href="#" onClick={() => formState.reset()}>Reset form</a>
        <a href="#" onClick={() => logout()}>Logout</a>
      </div>
    </header>
    { uploadState === 'pending' && <div>
      <form className="d-flex flex-column row-gap-4">
        <div id="core-inputs" className="d-flex w-100 justify-content-between column-gap-4">
          <label className="flex-grow-1">
            <span>Date</span>
            <input className="w-100" type="date" value={formState.date} onChange={(e) => formState.setDate(e.target.value)} />
          </label>
          <label className="flex-grow-1">
            <span>First name</span>
            <input className="w-100" type="text" autoComplete="off" value={formState.firstName} onChange={(e) => formState.setFirstName(e.target.value)} />
          </label>
          <label className="flex-grow-1">
            <span>Last name</span>
            <input className="w-100" type="text" autoComplete="off" value={formState.lastName} onChange={(e) => formState.setLastName(e.target.value)} />
          </label>
        </div>
        <div className="file-upload p-4" onClick={(e) => fileButton.current.click(e)}>
          <span>Click to select files</span>
          <input ref={fileButton} id="file-upload" type="file" accept="image/*" multiple onChange={handleFiles} />
        </div>
        <div id="image-previews" className="d-flex flex-column row-gap-4">
          { images.map((src, index) => <ImageCard key={index} index={index} src={src} onRemove={onRemove} />) }
        </div>
        <div>
          <button onClick={(e) => { e.preventDefault(); upload(); }}>Save photos</button>
        </div>
      </form>
    </div> }
    { uploadState === 'uploading' && <div>Uploading..</div>}
    { uploadState === 'success' && <div>
      <p>Upload completed!</p>
      <button onClick={() => setUploadState('pending')}>Continue</button>
      </div>}
    { uploadState === 'unauthorized' && <div>
      <p>Your login has expired. Please login again.</p>
      <LoginButton />
    </div> }
    { uploadState === 'failed' && <div>
        <p>The upload failed and we cannot say for sure why. Please send this information to the developer or admin:</p>
        <code>{ errorInformation }</code>
      </div> }
  </div>
}